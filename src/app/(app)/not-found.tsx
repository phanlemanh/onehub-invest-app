import { NotFoundState } from "@/components/states/not-found-state";

/** 404 trong Invest Portal — giữ shell + ô tìm ⌘K. */
export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <NotFoundState />
    </div>
  );
}
