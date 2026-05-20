import type { Results } from "@riavzon/utils";

export interface  WorkerRequest {
  id: string;
  action: string;
  decryptedPassword: string;
  args: unknown[];
};


export type ResultsWithId<T> = Results<T> & { id: string }