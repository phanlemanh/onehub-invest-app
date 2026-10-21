import { NotFoundState } from "@/components/states/not-found-state";

/** 404 ngoài mọi portal (không shell). */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <NotFoundState />
    </main>
  );
}
