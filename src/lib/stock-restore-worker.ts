/** Background worker that restores rented equipment stock after 24 hours. */
import { restoreExpiredPurchases } from "./purchases";

const RESTORE_INTERVAL_MS = 60 * 1000;

type GlobalWithStockWorker = typeof globalThis & {
  __gearnestStockRestoreWorkerStarted__?: boolean;
};

const runRestore = async () => {
  try {
    await restoreExpiredPurchases();
  } catch (error) {
    console.error("Scheduled stock restore failed", error);
  }
};

export const startStockRestoreWorker = () => {
  const globalRef = globalThis as GlobalWithStockWorker;

  // Next.js dev can reload modules; keep one timer per server process.
  if (globalRef.__gearnestStockRestoreWorkerStarted__) return;
  globalRef.__gearnestStockRestoreWorkerStarted__ = true;

  // Catch purchases that expired while the server was stopped.
  void runRestore();

  const timer = setInterval(() => void runRestore(), RESTORE_INTERVAL_MS);
  (timer as { unref?: () => void }).unref?.();
};
