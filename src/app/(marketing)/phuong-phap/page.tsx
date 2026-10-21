import type { Metadata } from "next";

import { FaqSection, type FaqItem } from "@/components/marketing/faq-section";
import { Badge } from "@/components/reui/badge";
import { COST_DEFAULTS, LT_TAX_PCT } from "@/lib/yield";

export const metadata: Metadata = {
  title: "Phương pháp & thuật ngữ",
  description: "Cách One Invest thu thập dữ liệu Airbnb và tính công suất, ADR, RevPAR, lợi suất.",
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

const METRICS: FaqItem[] = [
  {
    id: "lich-tuong-lai",
    question: "Số liệu tính trên khoảng thời gian nào?",
    answer:
      "Trên lịch đặt phòng của các tháng TỚI, tính từ ngày quét. Tháng gần đã có nhiều đêm được đặt; tháng xa còn ít, vì khách chưa đặt tới. Vì vậy công suất của các tháng xa thấp hơn thực tế — không có nghĩa là thị trường yếu. Chúng tôi chưa có lịch sử nhiều năm nên chưa so với cùng kỳ năm trước và chưa tính mùa vụ.",
  },
  {
    id: "da-dat",
    question: "Thế nào là một đêm “đã đặt”?",
    answer:
      "Đêm mà lịch Airbnb không còn cho đặt. Con số này có thể gồm cả đêm chủ nhà tự khoá lịch, nên công suất là cận trên của số đêm có khách thật.",
  },
  {
    id: "cong-suat",
    question: "Công suất (occupancy)",
    answer: "Đêm đã đặt ÷ (đêm đã đặt + đêm còn trống). Khi gộp nhiều tháng hoặc nhiều listing, chúng tôi gộp theo số đêm chứ không lấy trung bình các tháng.",
  },
  {
    id: "adr",
    question: "Giá phòng (ADR)",
    answer:
      "Doanh thu ÷ đêm đã đặt. Doanh thu ở đây là giá NIÊM YẾT của đêm, chưa trừ giảm giá, chưa gồm phí dọn dẹp và phí dịch vụ Airbnb. Khi một khu vực có đêm đặt nhưng chưa thu được giá, ADR hiển thị là “—”, không phải 0.",
  },
  {
    id: "revpar",
    question: "RevPAR",
    answer: "Doanh thu ÷ tổng đêm khả dụng (đã đặt + còn trống). Gộp cả giá lẫn công suất vào một số — chỉ số mặc định để xếp hạng phường.",
  },
  {
    id: "listing",
    question: "Listing hoạt động",
    answer: "Số listing có lịch trong tháng đông nhất của cửa sổ dữ liệu.",
  },
  {
    id: "phan-vi",
    question: "Các bậc màu và nhãn “Nhóm đầu / Khá / Trung bình / Thấp”",
    answer:
      "Theo phân vị p30, p60, p90 của các khu vực cùng cấp (phường cùng thị trường, hoặc listing cùng phường). Bản đồ và thanh trong bảng xếp hạng dùng cùng 4 bậc. Bảng xếp hạng chỉ tính khu vực có từ 5 listing trở lên — một hai listing cho số quá cực đoan.",
  },
];

const YIELD: FaqItem[] = [
  {
    id: "doanh-thu-mot-can",
    question: "Doanh thu ngắn hạn của một căn được ước tính thế nào?",
    answer:
      "Lấy các listing so sánh: cùng phường và cùng số phòng ngủ (cần ít nhất 5); không đủ thì lấy cả thị trường cùng số phòng ngủ; vẫn không đủ thì lấy cả thị trường. Với mỗi listing: giá niêm yết × công suất 90 đêm đầu của lịch × 365. Kết quả là trung vị, kèm khoảng p25–p75. Diện tích không ảnh hưởng doanh thu vì Airbnb không công bố diện tích.",
  },
  {
    id: "chi-phi",
    question: "Chi phí mặc định gồm những gì?",
    answer: `Phí quản lý ${pct(COST_DEFAULTS.mgmtPct)} doanh thu, phí nền tảng ${pct(COST_DEFAULTS.platformPct)}, thuế ${pct(COST_DEFAULTS.taxPct)} (tham khảo: hộ kinh doanh dịch vụ lưu trú 5% GTGT + 2% TNCN), chi phí cố định ${COST_DEFAULTS.fixedMonthly / 1e6} triệu ₫/tháng, nội thất ban đầu ${COST_DEFAULTS.setupCost / 1e6} triệu ₫. Tất cả sửa được trên form — đây là giả định, không phải số đo.`,
  },
  {
    id: "dai-han",
    question: "So với cho thuê dài hạn thế nào?",
    answer: `Giá thuê dài hạn trung vị của phường, trừ thuế ${pct(LT_TAX_PCT)} (tham khảo: cho thuê tài sản 5% GTGT + 5% TNCN). Mốc “ngang thuê dài hạn” trên biểu đồ là biên lợi nhuận mà ngắn hạn cần đạt để thu nhập ròng bằng thuê dài hạn.`,
  },
  {
    id: "do-tin-cay",
    question: "Độ tin cậy Cao / Trung bình / Thấp nghĩa là gì?",
    answer:
      "Cao: ≥ 10 listing cùng phường, cùng số phòng ngủ, giá không quá phân tán. Trung bình: ≥ 5 listing (có thể đã lùi về cả thị trường). Thấp: phải lấy cả thị trường bất kể số phòng ngủ.",
  },
];

const SOURCES: FaqItem[] = [
  {
    id: "airbnb",
    question: "Airbnb (tự thu thập)",
    answer:
      "Hà Nội và TP. Hồ Chí Minh: collector duyệt tìm kiếm Airbnb bằng trình duyệt thật rồi đọc lịch và giá của từng listing, chạy định kỳ. Mỗi lần quét chỉ thấy một phần thị trường, nên số listing “mới” là mới xuất hiện trong kết quả, không hẳn mới đăng.",
  },
  {
    id: "ranh-gioi",
    question: "Ranh giới phường",
    answer: "Từ OpenStreetMap (đơn vị hành chính sau sáp nhập 2025). Listing được gán vào phường theo toạ độ.",
  },
  {
    id: "mo-phong",
    question: "Giá bán và giá thuê dài hạn",
    answer: (
      <p>
        <Badge variant="warning-light" className="me-1.5">Mô phỏng</Badge>
        Hiện là tin rao giả lập để dựng tính năng lợi suất; sẽ thay bằng tin rao thật. Mọi chỗ dùng số này đều gắn nhãn
        “Mô phỏng”.
      </p>
    ),
  },
  {
    id: "airdna",
    question: "Có dùng AirDNA không?",
    answer:
      "Chỉ nội bộ, để đối chiếu và hiệu chuẩn phương pháp. Số liệu AirDNA không hiển thị trên các trang dành cho nhà đầu tư.",
  },
];

/** Phương pháp & thuật ngữ (IA L8, L11) — mọi ⓘ định nghĩa trong portal trỏ về đây. */
export default function MethodologyPage() {
  return (
    <div className="flex flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16">
      <header className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Badge variant="outline" size="xl" radius="full" className="text-foreground h-7 w-fit">
          Phương pháp
        </Badge>
        <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance">
          Số liệu đến từ đâu, và được tính thế nào
        </h1>
        <p className="text-muted-foreground text-base leading-7 text-pretty">
          Định nghĩa từng chỉ số, mô hình ước tính lợi suất và các nguồn dữ liệu — kể cả những giới hạn hiện tại.
        </p>
        <nav aria-label="Mục lục" className="flex flex-wrap gap-2 pt-2">
          {[
            ["chi-so", "Chỉ số"],
            ["loi-suat", "Lợi suất"],
            ["nguon", "Nguồn dữ liệu"],
          ].map(([id, label]) => (
            <Badge key={id} variant="outline" render={<a href={`#${id}`} />} className="hover:bg-accent transition-colors">
              {label}
            </Badge>
          ))}
        </nav>
      </header>

      <FaqSection id="chi-so" title="Chỉ số" items={METRICS} defaultOpen="lich-tuong-lai" />
      <FaqSection id="loi-suat" title="Mô hình lợi suất" items={YIELD} />
      <FaqSection id="nguon" title="Nguồn dữ liệu" items={SOURCES} />
    </div>
  );
}
