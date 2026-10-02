import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "size-7 rounded-full after:rounded-full", text: "text-[12px]" },
  md: { box: "size-8 rounded-chip after:rounded-chip", text: "text-[14px]" },
  lg: { box: "size-12 rounded-control after:rounded-control", text: "text-[18px]" },
  xl: { box: "size-16 rounded-card after:rounded-card", text: "text-[28px]" },
} as const;

/**
 * Logo sàn hoặc ảnh đại diện shop lấy từ AccessTrade. Ảnh lỗi thì hiện chữ
 * cái đầu của tên.
 */
export function StoreLogo({
  name,
  image,
  size = "md",
  className,
}: {
  name: string;
  image?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Avatar
      aria-label={name}
      className={cn(sizes[size].box, "bg-white", className)}
    >
      {image && (
        <AvatarImage
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="rounded-[inherit] object-contain"
        />
      )}
      <AvatarFallback
        className={cn(
          "brand-gradient rounded-[inherit] font-bold text-white",
          sizes[size].text,
        )}
      >
        {name.trim().charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
