import { RefreshCw, TriangleAlert } from "lucide-react";

import { formatTimeAgo } from "@/lib/format";
import type { SyncInfo } from "@/lib/types";

/**
 * Báo cho người dùng khi dữ liệu chưa đầy đủ (server mới khởi động) hoặc đã
 * lâu không đồng bộ được từ AccessTrade.
 */
export function SyncNotice({ syncInfo }: { syncInfo: SyncInfo }) {
  if (!syncInfo.isComplete) {
    return (
      <p className="mb-6 flex items-center gap-2 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning">
        <RefreshCw className="size-4 shrink-0 animate-spin" />
        Đang tải dữ liệu từ AccessTrade, danh sách sẽ đầy đủ sau ít phút. Tải lại
        trang để xem thêm mã.
      </p>
    );
  }

  if (syncInfo.isStale) {
    return (
      <p className="mb-6 flex items-center gap-2 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-warning">
        <TriangleAlert className="size-4 shrink-0" />
        Dữ liệu được cập nhật lần cuối {formatTimeAgo(syncInfo.syncedAt)}. Hệ thống
        đang thử lấy lại từ AccessTrade, một số mã có thể đã thay đổi.
      </p>
    );
  }

  return null;
}
