import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

/**
 * GET /api/zalo-media?path=<mediaPath> — serve ảnh staging của OpenClaw cho
 * trang Deals (G2). CHỈ nhận path trong thư mục staging OpenClaw (chặn
 * arbitrary file read); KHÔNG sync cloud (route trả 404 khi file không tồn
 * tại — đúng vì media là tầng A local).
 */
const ALLOWED_PREFIXES = [
  path.join(process.env.HOME ?? "/Users", ".openclaw/media"),
  "/tmp/openclaw",
  path.join(process.env.HOME ?? "/Users", ".openclaw"),
];

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("path");
  if (!p) return new Response("thiếu path", { status: 400 });
  const resolved = path.resolve(p);
  if (!ALLOWED_PREFIXES.some((prefix) => resolved.startsWith(prefix))) {
    return new Response("path ngoài vùng cho phép", { status: 403 });
  }
  try {
    const st = await stat(resolved);
    if (!st.isFile()) return new Response("not found", { status: 404 });
    const buf = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": MIME[ext] ?? "application/octet-stream",
        "cache-control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
