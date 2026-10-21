import Link from "next/link";
import { MapPinOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd } from "@/components/ui/kbd";

/** 404 chuẩn (c-empty-3) — dùng ở root và trong (app) để giữ shell. */
export function NotFoundState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinOffIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>404 — Không tìm thấy trang</EmptyTitle>
        <EmptyDescription>
          Khu vực hoặc trang bạn tìm không tồn tại, hoặc chưa có dữ liệu.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/vn" />}>
          Xem thị trường Việt Nam
        </Button>
        <EmptyDescription>
          Trong portal, nhấn <Kbd>⌘K</Kbd> để tìm tỉnh hoặc phường.
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
