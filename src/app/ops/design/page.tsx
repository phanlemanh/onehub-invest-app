import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Pattern as CardStatTrend } from "@/components/examples/c-card-15";
import { Pattern as ChartAreaGlow } from "@/components/examples/c-chart-16";
import { ChartBar as ChartBarMultiple } from "@/components/examples/c-chart-2";
import { Pattern as ChartDonutCenter } from "@/components/examples/c-chart-19";
import { Pattern as DataGridSortable } from "@/components/examples/c-data-grid-11";

const sections = [
  {
    title: "c-card-15 — Stat card + trend",
    hint: "KPI card cho Market Score, ADR, occupancy",
    node: <CardStatTrend />,
  },
  {
    title: "c-chart-16 — Area chart + glowing dots",
    hint: "Timeseries revenue / ADR / occupancy theo tháng",
    node: <ChartAreaGlow />,
  },
  {
    title: "c-chart-2 — Multi-dataset bar",
    hint: "So sánh ADR theo size / room type / city",
    node: <ChartBarMultiple />,
  },
  {
    title: "c-chart-19 — Donut + center total",
    hint: "Phân bổ revenue theo submarket",
    node: <ChartDonutCenter />,
  },
];

export default function DesignGalleryPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">ReUI Gallery — đã cài</h1>
        <p className="text-sm text-muted-foreground">
          5 block từ @reui (style base-nova). Quy tắc chọn component: xem{" "}
          <code>app/DESIGN_RULES.md</code> (B1 ReUI → B2 shadcn → B3 tạo mới).
        </p>
      </header>

      {sections.map((s) => (
        <section key={s.title} className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.hint}</CardDescription>
            </CardHeader>
            <CardContent>{s.node}</CardContent>
          </Card>
        </section>
      ))}

      <section className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              c-data-grid-11 — Sortable data grid
            </CardTitle>
            <CardDescription>
              Bảng phường / listings — sort, pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataGridSortable />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
