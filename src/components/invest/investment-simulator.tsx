"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/reui/badge";

/**
 * Máy tính dòng tiền đầu tư BĐS cho thuê (G3) — tính client-side tức thời.
 * Hai kịch bản cạnh nhau: cho thuê ngắn hạn (STR — Airbnb/AirDNA) vs dài
 * hạn (LTR — vải Chợ Tốt). Nguyên tắc UX: mọi giả định HIỆN rõ beside số,
 * số âm màu đỏ, không giấu chi phí.
 */
type Props = {
  defaults: {
    marketName: string;
    salePerm2: number | null;
    saleN: number;
    rentLt: number | null;
    rentN: number;
    adr: number | null;
    occupancy: number | null;
    adrPeriod: string | null;
  };
};

function Field({
  label,
  suffix,
  value,
  onChange,
  step = 1,
  min = 0,
  hint,
}: {
  label: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex items-baseline justify-between">
        <span>{label}</span>
        {hint && <span className="text-muted-foreground text-[10px]">{hint}</span>}
      </span>
      <span className="flex items-center rounded-md border bg-background">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent px-2 py-1.5 text-sm tabular-nums outline-none"
        />
        {suffix && <span className="text-muted-foreground pr-2 text-xs">{suffix}</span>}
      </span>
    </label>
  );
}

const fmtTr = (v: number) =>
  v >= 1e9 ? `${(v / 1e9).toFixed(2)} tỷ` : `${Math.round(v / 1e6)} tr`;

export function InvestmentSimulator({ defaults }: Props) {
  const [salePerm2, setSalePerm2] = useState((defaults.salePerm2 ?? 80e6) / 1e6);
  const [areaM2, setAreaM2] = useState(60);
  const [equityPct, setEquityPct] = useState(30);
  const [ratePct, setRatePct] = useState(9);
  const [years, setYears] = useState(20);
  const [furnishM, setFurnishM] = useState(3); // tr/m²
  const [adrK, setAdrK] = useState((defaults.adr ?? 900e3) / 1e3); // nghìn/đêm
  const [occPct, setOccPct] = useState(defaults.occupancy ?? 45);
  const [rentLtM, setRentLtM] = useState((defaults.rentLt ?? 8e6) / 1e6);
  const [opsStrPct, setOpsStrPct] = useState(25);
  const [opsLtPct, setOpsLtPct] = useState(10);

  const r = useMemo(() => {
    const price = salePerm2 * 1e6 * areaM2; // giá mua
    const furnish = furnishM * 1e6 * areaM2;
    const fee = price * 0.005; // phí giao dịch ~0.5%
    const equity = ((price + furnish + fee) * equityPct) / 100;
    const loan = price + furnish + fee - equity;
    const rMonthly = ratePct / 100 / 12;
    const nPay = years * 12;
    const pay = loan > 0 && rMonthly > 0
      ? (loan * rMonthly) / (1 - Math.pow(1 + rMonthly, -nPay))
      : 0; // trả nợ/tháng (annuity)

    const nights = (adrK * 1e3) * (occPct / 100) * 30.4; // doanh thu brutto STR/tháng
    const strNet = nights * (1 - opsStrPct / 100);
    const ltNet = rentLtM * 1e6 * (1 - opsLtPct / 100);

    const str = {
      grossMonth: nights,
      netMonth: strNet,
      cf: strNet - pay, // dòng tiền ròng sau nợ
      cocYear: equity > 0 ? ((strNet - pay) * 12) / equity : 0,
      grossYield: price > 0 ? (nights * 12) / price : 0,
      breakEvenYears: strNet - pay > 0 ? equity / ((strNet - pay) * 12) : Infinity,
    };
    const lt = {
      grossMonth: rentLtM * 1e6,
      netMonth: ltNet,
      cf: ltNet - pay,
      cocYear: equity > 0 ? ((ltNet - pay) * 12) / equity : 0,
      grossYield: price > 0 ? (rentLtM * 1e6 * 12) / price : 0,
      breakEvenYears: ltNet - pay > 0 ? equity / ((ltNet - pay) * 12) : Infinity,
    };
    return { price, furnish, fee, equity, loan, pay, str, lt };
  }, [salePerm2, areaM2, equityPct, ratePct, years, furnishM, adrK, occPct, rentLtM, opsStrPct, opsLtPct]);

  const Scenario = ({ name, d, accent }: { name: string; d: typeof r.str; accent: boolean }) => (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${accent ? "border-primary/40" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{name}</h3>
        <Badge variant={d.cf >= 0 ? "success-light" : "destructive"}>
          {d.cf >= 0 ? "dòng tiền dương" : "âm"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground text-[10px]">Doanh thu brutto/tháng</p>
          <p className="tabular-nums font-medium">{fmtTr(d.grossMonth)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Ròng sau vận hành</p>
          <p className="tabular-nums font-medium">{fmtTr(d.netMonth)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Dòng tiền sau nợ/tháng</p>
          <p className={`tabular-nums font-semibold ${d.cf >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {d.cf >= 0 ? "+" : "−"}{fmtTr(Math.abs(d.cf))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Cash-on-cash /năm</p>
          <p className="tabular-nums font-semibold">{(d.cocYear * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Tổng lợi suất brutto/năm</p>
          <p className="tabular-nums">{(d.grossYield * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px]">Hoàn vốn tự có</p>
          <p className="tabular-nums">
            {Number.isFinite(d.breakEvenYears) ? `${d.breakEvenYears.toFixed(1)} năm` : "không hoàn vốn"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <h3 className="text-sm font-medium">Mua &amp; vốn</h3>
          <Field label="Giá mua" suffix="tr/m²" step={1} value={salePerm2}
            onChange={setSalePerm2}
            hint={defaults.saleN > 0 ? `median P2: ${Math.round((defaults.salePerm2 ?? 0) / 1e6)}tr (n=${defaults.saleN})` : undefined} />
          <Field label="Diện tích" suffix="m²" value={areaM2} onChange={setAreaM2} step={5} />
          <Field label="Nội thất" suffix="tr/m²" step={0.5} value={furnishM} onChange={setFurnishM} />
          <Field label="Vốn tự có" suffix="%" value={equityPct} onChange={setEquityPct} step={5} min={10} />
          <Field label="Lãi suất vay" suffix="%/năm" step={0.5} value={ratePct} onChange={setRatePct} />
          <Field label="Kỳ hạn" suffix="năm" value={years} onChange={setYears} step={5} min={5} />
          <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-2 text-[11px]">
            <p>Giá mua: <span className="tabular-nums text-foreground">{fmtTr(r.price)}</span></p>
            <p>Tổng vốn ban đầu: <span className="tabular-nums text-foreground">{fmtTr(r.equity)}</span></p>
            <p>Khoản vay: <span className="tabular-nums text-foreground">{fmtTr(r.loan)}</span></p>
            <p>Trả nợ/tháng: <span className="tabular-nums text-foreground">{fmtTr(r.pay)}</span></p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <h3 className="text-sm font-medium">Doanh thu &amp; chi phí vận hành</h3>
          <Field label="Giá đêm (ADR)" suffix="nghìn/đêm" step={10} value={adrK} onChange={setAdrK}
            hint={defaults.adr ? `AirDNA ${defaults.adrPeriod}: ${Math.round(defaults.adr / 1e3)}k` : "không có AirDNA cho market này"} />
          <Field label="Công suất" suffix="%" value={occPct} onChange={setOccPct} step={1}
            hint={defaults.occupancy != null ? `AirDNA: ${defaults.occupancy}%` : undefined} />
          <Field label="Chi phí STR (sạch sẽ, kênh, quản lý)" suffix="%" value={opsStrPct} onChange={setOpsStrPct} step={1} />
          <div className="h-px bg-border" />
          <Field label="Thuê dài hạn" suffix="tr/tháng" step={0.5} value={rentLtM} onChange={setRentLtM}
            hint={defaults.rentN > 0 ? `median P2: ${Math.round((defaults.rentLt ?? 0) / 1e6)}tr (n=${defaults.rentN})` : undefined} />
          <Field label="Chi phí LTR (bảo trì, trống)" suffix="%" value={opsLtPct} onChange={setOpsLtPct} step={1} />
          <p className="text-muted-foreground text-[10px]">
            Doanh thu STR = ADR × công suất × 30,4 đêm. Chi phí chưa gồm thuế TNCN
            (10% cho thuê) và khấu hao — xem như biên an toàn.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Scenario name="Cho thuê ngắn hạn (STR)" d={r.str} accent />
        <Scenario name="Cho thuê dài hạn (LTR)" d={r.lt} accent={false} />
      </div>
    </div>
  );
}
