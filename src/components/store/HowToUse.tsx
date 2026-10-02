const steps = [
  {
    title: "Bấm “Xem mã”",
    description: "Mã đầy đủ hiện ra trong popup và trang mã trên sàn mở sẵn ở tab mới.",
  },
  {
    title: "Copy và dán ở thanh toán",
    description: "Dán mã vào ô Voucher trước khi đặt hàng.",
  },
  {
    title: "Kiểm tra điều kiện",
    description: "Mã thường chỉ áp dụng cho sản phẩm của shop phát hành và đơn đạt mức tối thiểu.",
  },
];

export function HowToUse({ storeName }: { storeName: string }) {
  return (
    <section id="how-it-works" className="mt-16">
      <h2 className="mb-6 text-[28px] font-bold leading-[1.2]">
        Cách dùng mã {storeName}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-card border border-line-subtle bg-raised p-5"
          >
            <span className="mb-4 flex size-12 items-center justify-center rounded-control bg-brand-500/12">
              <span className="brand-text font-mono text-[24px] font-semibold">
                {index + 1}
              </span>
            </span>
            <p className="mb-1 text-[15px] font-semibold">{step.title}</p>
            <p className="text-[13px] text-fg-secondary">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
