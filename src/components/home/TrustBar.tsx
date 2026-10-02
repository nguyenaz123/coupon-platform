import { formatCount, formatTimeAgo } from "@/lib/format";
import type { SyncInfo } from "@/lib/types";

/** Số liệu thật của dữ liệu đang hiển thị */
export function TrustBar({
  couponCount,
  shopCount,
  syncInfo,
}: {
  couponCount: number;
  shopCount: number;
  syncInfo: SyncInfo;
}) {
  const stats = [
    { value: formatCount(couponCount), label: "mã giảm giá đang có" },
    { value: formatCount(shopCount), label: "shop đang phát mã" },
    { value: formatTimeAgo(syncInfo.syncedAt), label: "lần cập nhật gần nhất" },
  ];

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 gap-6 rounded-panel border border-line-subtle bg-raised p-6 text-center md:grid-cols-3 md:p-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index === 1 ? "md:border-x md:border-line-subtle" : undefined
            }
          >
            <p className="brand-text font-mono text-[28px] font-semibold">
              {stat.value}
            </p>
            <p className="mt-1 text-[13px] text-fg-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-fg-muted">
        Dữ liệu lấy trực tiếp từ AccessTrade, tự đồng bộ lại khoảng 30 phút sau
        mỗi lần cập nhật xong.
      </p>
    </section>
  );
}
