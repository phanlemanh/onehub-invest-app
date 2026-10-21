import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton theo đúng bố cục trang Insight (IA §3.2): header → hàng 4 KPI →
 * 2 chart → bảng. Giữ chỗ để không nhảy layout khi dữ liệu về.
 *
 * Dùng làm fallback cho <Suspense> TRONG trang, không đặt loading.tsx ở cấp
 * segment: loading.tsx stream sớm nên notFound()/redirect() mất mã 404/307.
 */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}
