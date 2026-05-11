import consola from "consola";


export async function fetchWithRetry(url: string, retries = 5, delay = 1000, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (res.status === 429 && retries > 0) {
      consola.warn(`Rate limited. Retrying in ${String(delay * 60)}s...`);
      await new Promise(res => setTimeout(res, delay));
      return await fetchWithRetry(url, retries - 1, delay * 2, init);
    }
    return res;
  } catch (err) {
    if (retries > 0) 
    return fetchWithRetry(url, retries - 1, delay * 2, init);
    throw err;
  }
}