/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { app, utilityProcess } from "electron";
import path from "path";
import fs from 'node:fs';
import type { ResultsWithId } from "@/types/OperationWorker";
import crypto from 'node:crypto';

let dbProcess: ReturnType<typeof utilityProcess.fork> | null = null;
const currentDir = import.meta.dirname;
const workerPath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', '.vite', 'build', 'worker.mjs') : 
        path.join(currentDir, '..', '..', 'dist-worker', 'OperationWorker.mjs');



export const spawnDbProcess = () => {
  if (dbProcess) return dbProcess;
  console.log('Spawning database worker...');

   if (!fs.existsSync(workerPath)) {
        throw new Error(`Worker file missing at: ${workerPath}`);
   } 

  dbProcess = utilityProcess.fork(workerPath, [], {stdio: 'pipe'});

  dbProcess.on('exit', (code) => {
    dbProcess = null; 
    console.error(`Database worker exited with code ${code}. Restarting in 1s...`);
    setTimeout(spawnDbProcess, 1000);
  });
  console.log('Spawned successfully!');

  return dbProcess;
};



export const getDbProcess = () => {
  if (!dbProcess) {
    throw new Error("Database process not initialized. Call spawnDbProcess first.");
  }
  return dbProcess;
};

export const routeOps = <T>(action: string, decryptedPassword?: string, args: unknown[] = []) => {
  return new Promise<ResultsWithId<T>>((resolve) => {
      const requestId = crypto.randomUUID();
      const dbProcess = getDbProcess();

      const handleResponse = (payload: unknown) => {    
        const data = payload as ResultsWithId<T>; 
        if (data.id !== requestId) return;
        dbProcess.off('message', handleResponse);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        resolve(data);
      };
    dbProcess.on('message', handleResponse);
    dbProcess.postMessage({ 
      id: requestId,
      action, 
      decryptedPassword, 
      args, 
    });
  });
};