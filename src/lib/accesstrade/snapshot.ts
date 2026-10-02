import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { todayInVietnam } from "@/lib/format";

import {
  fetchApprovedMerchants,
  fetchMerchants,
  fetchOffersPage,
  PAGE_SIZE,
  type RawMerchant,
} from "./client";
import { mapOffer, type CouponRecord } from "./mapper";

/**
 * Bản sao toàn bộ mã từ AccessTrade. API giới hạn tần suất gọi, mỗi trang chỉ
 * 100 mã (37–83 trang) và hay trả 403 ngẫu nhiên, nên không thể gọi theo từng
 * request của người dùng: dữ liệu được đồng bộ nền theo lịch, giữ trong bộ
 * nhớ và ghi ra file để khởi động lại server không phải đồng bộ từ đầu.
 *
 * - Một trang lỗi không làm hỏng cả lượt: nghỉ rồi thử lại đúng trang đó.
 * - Lượt bị dừng hẳn thì lần sau chạy tiếp từ trang đang dở.
 * - Lượt mới bắt đầu SYNC_INTERVAL_MS sau khi lượt trước hoàn tất.
 */

export interface Snapshot {
  coupons: CouponRecord[];
  merchants: RawMerchant[];
  /** Sàn đã được duyệt chiến dịch; bản lưu từ phiên cũ có thể không có */
  approvedMerchants?: string[];
  /** Lúc bắt đầu lấy dữ liệu của bản này */
  syncedAt: string;
  /** Lúc lấy xong; bản lưu từ phiên cũ có thể không có */
  completedAt?: string;
  isComplete: boolean;
}

export const SYNC_INTERVAL_MS = 30 * 60 * 1000;
/** Dữ liệu cũ hơn mức này thì báo cho người dùng biết */
export const STALE_AFTER_MS = 2 * 60 * 60 * 1000;
/** Lượt đồng bộ bị dừng thì đợi một lúc mới chạy tiếp, tránh gọi API liên tục */
const RESUME_AFTER_FAILURE_MS = 5 * 60 * 1000;
/** Một trang lỗi hết số lần thử của client thì nghỉ rồi thử lại, tối đa số vòng này */
const PAGE_RETRY_ROUNDS = 10;
const PAGE_RETRY_DELAY_MS = 60 * 1000;
/** Lượt dở dang quá cũ thì bỏ, dữ liệu ghép từ hai thời điểm quá xa nhau */
const MAX_RESUME_AGE_MS = 3 * 60 * 60 * 1000;
/** Chặn vòng lặp vô hạn nếu API trả trang đầy mãi */
const MAX_PAGES = 300;
const SCHEDULER_TICK_MS = 60 * 1000;
const SNAPSHOT_FILE = path.join(process.cwd(), ".cache", "accesstrade-snapshot.json");

/** Lượt đồng bộ đang dở, giữ lại để chạy tiếp khi bị dừng */
interface Progress {
  startedAt: string;
  merchants?: RawMerchant[];
  approvedMerchants?: string[];
  nextPage: number;
  coupons: CouponRecord[];
}

interface State {
  snapshot?: Snapshot;
  loadedFromDisk: boolean;
  progress?: Progress;
  sync?: Promise<void>;
  /** Có trang đầu tiên của lượt đồng bộ đang chạy */
  firstPage?: Promise<void>;
  lastFailureAt?: number;
  scheduler?: ReturnType<typeof setInterval>;
}

// Giữ trên globalThis để HMR ở môi trường dev không làm mất dữ liệu
const globalState = globalThis as typeof globalThis & { __accesstrade?: State };
const state: State = (globalState.__accesstrade ??= { loadedFromDisk: false });

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function loadFromDisk(): Promise<void> {
  if (state.loadedFromDisk) return;
  state.loadedFromDisk = true;
  try {
    const saved = JSON.parse(await readFile(SNAPSHOT_FILE, "utf8")) as Snapshot;
    if (!state.snapshot && Array.isArray(saved.coupons)) state.snapshot = saved;
  } catch {
    // Chưa có file hoặc file hỏng: đồng bộ lại từ đầu
  }
}

async function saveToDisk(snapshot: Snapshot): Promise<void> {
  try {
    await mkdir(path.dirname(SNAPSHOT_FILE), { recursive: true });
    const temp = `${SNAPSHOT_FILE}.tmp`;
    await writeFile(temp, JSON.stringify(snapshot));
    await rename(temp, SNAPSHOT_FILE);
  } catch (error) {
    // Môi trường chỉ đọc (serverless) vẫn chạy được, chỉ mất cache qua lần khởi động
    console.warn("[accesstrade] Không ghi được snapshot:", error);
  }
}

function dedupe(coupons: CouponRecord[]): CouponRecord[] {
  return [...new Map(coupons.map((coupon) => [coupon.id, coupon])).values()];
}

/** Thử lại một bước nhiều vòng thay vì bỏ cả lượt đồng bộ khi API lỗi tạm thời */
async function withPatience<T>(label: string, task: () => Promise<T>): Promise<T> {
  for (let round = 1; ; round += 1) {
    try {
      return await task();
    } catch (error) {
      if (round >= PAGE_RETRY_ROUNDS) throw error;
      console.warn(
        `[accesstrade] ${label} lỗi (vòng ${round}/${PAGE_RETRY_ROUNDS}), thử lại sau ${PAGE_RETRY_DELAY_MS / 1000} giây:`,
        error instanceof Error ? error.message : error,
      );
      await sleep(PAGE_RETRY_DELAY_MS);
    }
  }
}

function freshProgress(): Progress {
  return { startedAt: new Date().toISOString(), nextPage: 1, coupons: [] };
}

async function runSync(onFirstPage: () => void): Promise<void> {
  const resumable =
    state.progress &&
    Date.now() - new Date(state.progress.startedAt).getTime() < MAX_RESUME_AGE_MS;
  const progress = resumable && state.progress ? state.progress : freshProgress();
  state.progress = progress;

  if (progress.nextPage > 1) {
    console.info(`[accesstrade] Chạy tiếp lượt đồng bộ từ trang ${progress.nextPage}`);
  }

  try {
    const merchants = (progress.merchants ??= await withPatience(
      "Danh sách sàn",
      fetchMerchants,
    ));
    const approvedMerchants = (progress.approvedMerchants ??= await withPatience(
      "Danh sách chiến dịch đã duyệt",
      fetchApprovedMerchants,
    ));

    while (progress.nextPage <= MAX_PAGES) {
      const page = progress.nextPage;
      const offers = await withPatience(`Trang ${page}`, () => fetchOffersPage(page));
      // API vẫn trả mã đã hết hạn (nhất là quanh nửa đêm), không cần giữ lại
      const today = todayInVietnam();
      progress.coupons.push(
        ...offers
          .map(mapOffer)
          .filter((item): item is CouponRecord => item !== undefined && item.endDate >= today),
      );
      progress.nextPage = page + 1;

      // Chưa có bản đầy đủ nào: cho trang hiển thị ngay phần đã lấy được
      if (!state.snapshot || !state.snapshot.isComplete) {
        state.snapshot = {
          coupons: dedupe(progress.coupons),
          merchants,
          approvedMerchants,
          syncedAt: progress.startedAt,
          isComplete: false,
        };
      }
      onFirstPage();
      if (page % 10 === 0) {
        console.info(
          `[accesstrade] Đang đồng bộ: trang ${page}, ${progress.coupons.length} mã còn hạn`,
        );
      }
      if (offers.length < PAGE_SIZE) break;
    }

    state.snapshot = {
      coupons: dedupe(progress.coupons),
      merchants,
      approvedMerchants,
      syncedAt: progress.startedAt,
      completedAt: new Date().toISOString(),
      isComplete: true,
    };
    state.progress = undefined;
    state.lastFailureAt = undefined;
    await saveToDisk(state.snapshot);

    const minutes = Math.round((Date.now() - new Date(progress.startedAt).getTime()) / 60_000);
    console.info(
      `[accesstrade] Đồng bộ xong ${state.snapshot.coupons.length} mã, ${progress.nextPage - 1} trang, ${minutes} phút`,
    );
  } catch (error) {
    // Giữ bản cũ và phần đã lấy được; lượt sau chạy tiếp từ trang đang dở
    state.lastFailureAt = Date.now();
    console.error(
      `[accesstrade] Đồng bộ tạm dừng ở trang ${progress.nextPage}, chạy tiếp sau ${RESUME_AFTER_FAILURE_MS / 60_000} phút:`,
      error,
    );
  } finally {
    onFirstPage();
  }
}

/** Thời điểm bản hiện tại lấy xong; bản lưu từ phiên cũ không có completedAt thì dùng syncedAt */
function completedAtMs(snapshot: Snapshot): number {
  return new Date(snapshot.completedAt ?? snapshot.syncedAt).getTime();
}

function isDue(): boolean {
  const now = Date.now();
  if (state.lastFailureAt && now - state.lastFailureAt < RESUME_AFTER_FAILURE_MS) {
    return false;
  }
  const { snapshot } = state;
  return (
    !snapshot ||
    !snapshot.isComplete ||
    Boolean(state.progress) ||
    now - completedAtMs(snapshot) >= SYNC_INTERVAL_MS
  );
}

/** Quy tắc duy nhất để bắt đầu đồng bộ, dùng cho cả lịch chạy lẫn lúc có request */
function maybeStartSync(): void {
  if (state.sync || !isDue()) return;

  let resolveFirstPage!: () => void;
  state.firstPage = new Promise((resolve) => (resolveFirstPage = resolve));
  state.sync = runSync(resolveFirstPage).finally(() => {
    state.sync = undefined;
    state.firstPage = undefined;
  });
}

/**
 * Bật lịch đồng bộ chạy nền, gọi từ `instrumentation.ts` khi server khởi động,
 * để dữ liệu được làm mới cả khi không có ai truy cập.
 */
export function startSyncScheduler(): void {
  if (state.scheduler) return;
  const tick = () => {
    loadFromDisk()
      .then(maybeStartSync)
      .catch((error) => console.error("[accesstrade] Lỗi lịch đồng bộ:", error));
  };
  state.scheduler = setInterval(tick, SCHEDULER_TICK_MS);
  // Không giữ process sống chỉ vì lịch đồng bộ
  state.scheduler.unref?.();
  tick();
}

/**
 * Trả về snapshot hiện có ngay lập tức. Nếu lịch đồng bộ không chạy (môi
 * trường không gọi instrumentation) thì request cũng kích hoạt đồng bộ khi đến
 * hạn. Chỉ chờ API khi server chưa có chút dữ liệu nào, và chỉ chờ tới trang đầu.
 */
export async function getSnapshot(): Promise<Snapshot> {
  await loadFromDisk();

  maybeStartSync();
  if (!state.snapshot) await state.firstPage;

  return (
    state.snapshot ?? {
      coupons: [],
      merchants: [],
      syncedAt: new Date(0).toISOString(),
      isComplete: false,
    }
  );
}

/** Bản đầy đủ gần nhất đã quá cũ so với lịch đồng bộ */
export function isSnapshotStale(snapshot: Snapshot): boolean {
  return snapshot.isComplete && Date.now() - completedAtMs(snapshot) > STALE_AFTER_MS;
}
