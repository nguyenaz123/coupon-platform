# Design System — SaveHunt (Trợ lý mua sắm tiết kiệm)

## 1. Product context

**SaveHunt** là website tổng hợp mã giảm giá / khuyến mãi cho các sàn TMĐT Việt Nam (Shopee, Lazada, TikTok Shop, Tiki, Sendo) và ưu đãi thẻ ngân hàng.

Người dùng **không mua hàng tại đây**. Họ vào để: tìm mã → lộ mã (reveal) → copy → nhảy sang sàn. Mọi quyết định thiết kế phải rút ngắn chuỗi này xuống 1–2 click.

**JTBD**

- "Tôi sắp mua nồi chiên không dầu, cho tôi mã Shopee còn hiệu lực trong 5 giây."
- "Hôm nay có deal nào giảm sâu đang cháy không, tôi sợ hết lượt."
- "Mã này còn dùng được không, hay đã hết hạn?" → dựa vào vote cộng đồng.

**Key pages**

| Trang                | Vai trò                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `/` Home             | Hero search + brand filter + Flash Deals + grid coupon + categories                |
| `/store/[slug]`      | Toàn bộ mã của 1 sàn, tab trạng thái, filter danh mục                               |
| `/coupon/[id]`       | Chi tiết mã: điều kiện áp dụng, hạn dùng, vote, mã liên quan                        |

**Key features (bắt buộc hiện diện trong design)**

1. Smart search với dropdown gợi ý (sản phẩm / sàn / danh mục).
2. Brand filter dạng dãy logo cuộn ngang, chip active rõ ràng.
3. Flash Deals: progress bar "đã dùng X%" + countdown timer.
4. Coupon card có mã bị che một phần (`SHOPTX•••`) + nút **XEM MÃ**.
5. Reveal popup: mã đầy đủ + nút COPY + auto mở tab sang sàn.
6. Tab trạng thái: Đang hoạt động / Sắp diễn ra / Độc quyền / Đã hết hạn.
7. Vote 👍 / 👎 kèm tỉ lệ "94% hoạt động".
8. Mobile-first: nút cao ≥ 48px, thao tác một ngón tay.

## 2. Branding & styling

### Color — Dark neon (đen sâu + cam/đỏ rực)

```css
:root {
  /* Surfaces */
  --bg-base: #0b0b0f; /* nền trang */
  --bg-raised: #14141b; /* card */
  --bg-overlay: #1c1c26; /* popup, dropdown, hover */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Brand — neon ember */
  --brand-500: #ff4d17; /* primary CTA */
  --brand-400: #ff6b35;
  --brand-300: #ff8f5e;
  --brand-600: #e03a08;
  --brand-gradient: linear-gradient(135deg, #ff4d17 0%, #ff9f1c 100%);

  /* Accent phụ — chỉ dùng cho badge độc quyền */
  --accent-magenta: #ff2d75;

  /* Semantic */
  --success: #22c55e; /* mã hoạt động, vote up */
  --warning: #fbbf24; /* sắp hết hạn */
  --danger: #ef4444; /* hết hạn, vote down */

  /* Text */
  --text-primary: #f8f8fb;
  --text-secondary: #a1a1b0;
  --text-muted: #6b6b7b;
  --text-on-brand: #ffffff;

  /* Glow — dấu hiệu nhận diện của hệ thống */
  --glow-brand: 0 0 32px rgba(255, 77, 23, 0.35);
  --glow-brand-strong: 0 0 56px rgba(255, 77, 23, 0.5);
}
```

**Nguyên tắc màu**

- Nền luôn tối. Không dùng nền trắng/sáng ở bất kỳ section nào.
- Cam/đỏ **chỉ** dành cho hành động và mức độ khan hiếm (CTA, countdown, progress bar, badge giảm sâu). Không tô cam cho văn bản dài.
- Mỗi màn hình chỉ có **một** CTA fill gradient nổi nhất trong vùng nhìn; các nút khác dùng outline hoặc ghost.
- MUST NOT: gradient xanh/tím kiểu SaaS, màu pastel, pink neon làm màu chính.

### Typography

- Font duy nhất: **Inter** (400 / 500 / 600 / 700 / 800). Không dùng serif, không font trang trí.
- Mã giảm giá và countdown: **JetBrains Mono** 600, `letter-spacing: 0.08em` — chỉ dùng cho số/mã.

| Token       | Size / Weight / Line          | Dùng cho                        |
| ----------- | ----------------------------- | ------------------------------- |
| display     | clamp(2rem, 5vw, 3.5rem)/800/1.05 | Hero headline                   |
| h2          | 28px/700/1.2                  | Tiêu đề section                 |
| h3          | 20px/700/1.3                  | Tên coupon trên card            |
| body        | 15px/400/1.55                 | Nội dung                        |
| body-sm     | 13px/400/1.5                  | Điều kiện, meta                 |
| label       | 11px/600/1, uppercase, 0.1em  | Badge, tab, nhãn nhỏ            |
| code        | 18px/600 mono, 0.08em         | Mã giảm giá                     |

### Spacing & layout

- Thang 4px: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
- Container tối đa `1280px`, padding ngang: 16px (mobile) → 24px (tablet) → 40px (desktop).
- Grid coupon: 1 cột < 640px · 2 cột ≥ 640px · 3 cột ≥ 1024px · 4 cột ≥ 1440px. Gap 16px mobile, 24px desktop.
- Coupon card cao đều nhau trong một hàng, tỉ lệ gần vuông (~1:1 → 4:5), tuyệt đối không để card lệch chiều cao.
- Sticky: header search trên desktop; bottom bar CTA trên mobile ở trang chi tiết.

### Radius, border & shadow

- Radius: `8px` (chip, badge) · `12px` (button, input) · `16px` (coupon card) · `24px` (popup, section lớn).
- Card: `background: var(--bg-raised)`, `border: 1px solid var(--border-subtle)`.
- Hover card: viền đổi sang `rgba(255,77,23,0.4)` + `box-shadow: var(--glow-brand)` + `translateY(-2px)`.
- Coupon card mang **vết cắt tem voucher**: hai nửa vòng tròn màu `--bg-base` khoét ở hai cạnh bên, ngăn cách bởi đường gạch đứt `1px dashed var(--border-strong)` — chi tiết bắt buộc để card trông như voucher thật.
- Popup: `--bg-overlay` + `backdrop-filter: blur(12px)` trên lớp phủ `rgba(0,0,0,0.7)`.

### Component specs

**Button**

- Primary: `background: var(--brand-gradient)`, chữ trắng 600, radius 12px, cao 48px (mobile) / 44px (desktop), `box-shadow: var(--glow-brand)`; hover tăng glow.
- Secondary: nền trong suốt, `border: 1px solid var(--border-strong)`, chữ `--text-primary`.
- Ghost/icon: nền `rgba(255,255,255,0.05)`, hình vuông 40px.
- Copy button ở popup: full-width, có icon copy, sau khi bấm đổi sang trạng thái `--success` + chữ "Đã copy!".

**Coupon card (thành phần trung tâm)**

Thứ tự nội dung từ trên xuống: logo sàn (32px, bo 8px) + tên sàn → badge mức giảm (`GIẢM 50K`, nền gradient) → tiêu đề 2 dòng tối đa (`line-clamp-2`) → điều kiện áp dụng 1 dòng `--text-secondary` → đường gạch đứt + vết cắt → khối mã bị che (`SHOPTX•••` mono, nền `rgba(255,255,255,0.05)`, gạch đứt) + nút XEM MÃ → footer: hết hạn, tỉ lệ vote 👍/👎.

**Flash Deal card**

Coupon card + countdown pill (mono, nền `rgba(239,68,68,0.15)`, chữ `--danger`, có icon đồng hồ) + progress bar cao 6px radius full, track `rgba(255,255,255,0.08)`, fill `--brand-gradient` kèm nhãn "Đã dùng 85%". Khi ≥ 80% thêm nhãn cảnh báo "Sắp hết".

**Search**

Input cao 56px, nền `--bg-raised`, viền `--border-subtle`, icon kính lúp trái, nút tìm gradient bên phải. Focus: viền `--brand-500` + glow. Dropdown gợi ý dùng `--bg-overlay`, mỗi dòng có icon phân loại + text khớp được bôi đậm màu `--brand-300`.

**Brand filter**

Dãy chip cuộn ngang, ẩn scrollbar, mỗi chip = logo 28px + tên + số lượng mã. Active: viền `--brand-500`, nền `rgba(255,77,23,0.12)`, chữ `--brand-300`. Hai đầu dãy có gradient fade sang `--bg-base`.

**Tabs trạng thái**

Pill group trên nền `--bg-raised`, tab active nền gradient chữ trắng, tab thường chữ `--text-secondary`. Mỗi tab kèm số đếm.

**Vote**

Hai nút ghost nhỏ 👍/👎 kèm số; nút đã chọn nhận màu `--success` / `--danger`. Bên cạnh là dòng `94% hoạt động` màu `--success`.

### Motion

- Transition mặc định `180ms cubic-bezier(0.4, 0, 0.2, 1)`; hover card `220ms`.
- Popup: fade overlay + scale `0.96 → 1` trong `200ms`.
- Countdown: số nhảy từng giây, không animation nặng.
- Progress bar: fill chạy từ 0 → giá trị thật trong `600ms ease-out` khi vào viewport.
- Badge "HOT": pulse glow 2s vô hạn, biên độ nhẹ (opacity 0.6 → 1).
- Tôn trọng `prefers-reduced-motion: reduce` — tắt pulse và progress animation.

## 3. Yêu cầu riêng của dự án

- **Mobile-first tuyệt đối**: 80% người dùng dùng điện thoại. Mọi vùng chạm ≥ 44×44px, CTA chính nằm trong tầm ngón tay, dãy brand filter vuốt được, không có hover-only interaction.
- **Mã bị che mặc định**: mã đầy đủ chỉ xuất hiện trong popup sau khi bấm XEM MÃ.
- **Tín hiệu khan hiếm phải thật**: countdown và progress bar chỉ xuất hiện khi coupon có giới hạn thời gian/lượt.
- **Logo sàn là bắt buộc** cạnh mọi mã để tránh nhầm lẫn. Không thay bằng chữ viết tắt.
- Nội dung hiển thị bằng **tiếng Việt**, giá trị tiền dạng `50K`, `120.000đ`.
- Không đặt đường dẫn file local trong HTML; ảnh/logo dùng URL public.
