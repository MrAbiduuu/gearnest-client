/** Next.js startup hook. Runs once when a new server instance starts. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startStockRestoreWorker } = await import(
    "./lib/stock-restore-worker"
  );
  startStockRestoreWorker();
}
