/** Che phần cuối của mã, giữ lại vài ký tự đầu như giao diện coupon thật */
export function maskCode(code: string, visible = 4): string {
  return `${code.slice(0, Math.min(visible, Math.max(1, code.length - 2)))}•••`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}TR`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }
  return String(value);
}

export function formatCount(value: number): string {
  return value.toLocaleString("vi-VN");
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

/** "2026-10-13" → "13/10" */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

/** "2026-10-13" → "13/10/2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Ngày hiện tại theo giờ Việt Nam, dạng YYYY-MM-DD như `start_time` của API */
export function todayInVietnam(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(),
  );
}

/** Số ngày từ hôm nay (giờ Việt Nam) tới một ngày YYYY-MM-DD */
export function daysUntil(isoDate: string): number {
  return Math.round((Date.parse(isoDate) - Date.parse(todayInVietnam())) / 86_400_000);
}

/** Nhãn hạn dùng: "Hết hạn hôm nay", "Còn 3 ngày", "HSD 13/10" */
export function formatExpiry(endDate: string): string {
  const days = daysUntil(endDate);
  if (days <= 0) return "Hết hạn hôm nay";
  if (days === 1) return "Hết hạn ngày mai";
  if (days <= 7) return `Còn ${days} ngày`;
  return `HSD ${formatShortDate(endDate)}`;
}

/** Thời gian tương đối từ một mốc ISO: "5 phút trước", "2 giờ trước" */
export function formatTimeAgo(isoDateTime: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDateTime).getTime()) / 60_000),
  );
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}
