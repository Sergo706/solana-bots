import consola from "consola";


export async function fetchWithRetry(url: string, retries = 5, delay = 1000, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (res.status === 429 && retries > 0) {

      const jitter = Math.random() * (delay * 0.5);
      const totalWait = delay + jitter;

      consola.warn(`[429] Rate limited on ${url}. Retrying in ${(totalWait / 1000).toFixed(2)}s...`);
      await new Promise(res => setTimeout(res, totalWait));
      return await fetchWithRetry(url, retries - 1, delay * 2, init);
    }
    
    return res;
  } catch (err) {
    if (retries > 0) {
      consola.error(`[Network Error] ${url}. Retrying...`);
      return fetchWithRetry(url, retries - 1, delay * 2, init);
    }
    throw err;
  }
}