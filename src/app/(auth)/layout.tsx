import { NoiseTexture } from "@/components/auth/noise-texture";

/** Trang đăng nhập/đăng ký: toàn màn hình, không shell (theo auth-4/auth-5). */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-background relative min-h-svh w-full min-w-full overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <NoiseTexture
          className="text-foreground/[0.015] dark:text-foreground/[0.03]"
          frequency={0.5}
          octaves={5}
          slope={0.08}
          noiseOpacity={0.28}
        />
      </div>
      <div className="relative z-10 min-h-svh min-w-full">{children}</div>
    </div>
  );
}
