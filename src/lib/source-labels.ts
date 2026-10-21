/**
 * SPL tầng C (ADR-0007): mã nguồn → nhãn tiếng Việt hiển thị ở Invest Portal.
 * Tên nguồn thật KHÔNG bao giờ xuất hiện ở tầng serving/UI — chỉ mã + nhãn.
 */
const LABELS: Record<string, { vi: string; hint: string }> = {
  S01: { vi: "Tự thu", hint: "Thu thập trực tiếp từ nguồn công khai, tính metric riêng" },
  S02: { vi: "Hiệu chuẩn", hint: "Nguồn tham chiếu trả phí để đối chiếu, không trộn số" },
  S03: { vi: "Cộng đồng", hint: "Tin rao từ nhóm môi giới — parser tự trích xuất" },
  S04: { vi: "Địa giới mở", hint: "Dữ liệu ranh giới hành chính mở" },
};

export function sourceLabel(code: string): { vi: string; hint?: string } {
  return LABELS[code] ?? { vi: code };
}
