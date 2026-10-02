/**
 * Chạy một lần khi server Next khởi động: bật lịch đồng bộ dữ liệu AccessTrade.
 * Không chờ đồng bộ xong vì `register` phải hoàn tất trước khi server nhận
 * request; trang vẫn hiển thị bản đã lưu trong lúc đồng bộ chạy nền.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // `next build` cũng nạp file này, không gọi API trong lúc build
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { startSyncScheduler } = await import("@/lib/accesstrade/snapshot");
  startSyncScheduler();
}
