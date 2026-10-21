"use client";

import { PageError } from "@/components/states/page-error";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError {...props} />;
}
