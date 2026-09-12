"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** One shared chart theme, so Scam Radar and Malaysia Scam Pulse match. */
export const CHART = {
  purple: "#6D4AFF",
  hot: "#FF2E88",
  grid: "#EEF0F6",
  axis: "#9AA1AE",
  series: ["#4B27C4", "#6D4AFF", "#9B84FF", "#C9BDFF", "#FF2E88", "#FF7A2F"],
};

function TooltipCard({
  active,
  payload,
  label,
  suffix = "reports",
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: { label?: string } }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const heading = label ?? payload[0]?.payload?.label ?? payload[0]?.name ?? "";
  return (
    <div className="rounded-chip border border-line bg-white px-3 py-2 shadow-lift">
      <p className="text-[11px] font-bold text-ink">{heading}</p>
      <p className="text-[11px] font-bold text-purple-700">
        {Number(payload[0]?.value ?? 0).toLocaleString()} {suffix}
      </p>
    </div>
  );
}

export function TrendArea({ data }: { data: Array<{ day: string; value: number }> }) {
  const formatted = data.map((point) => ({
    ...point,
    label: new Date(point.day).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
  }));

  return (
    <div className="h-[210px] w-full px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 14, bottom: 4, left: -22 }}>
          <defs>
            <linearGradient id="radar-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.purple} stopOpacity={0.32} />
              <stop offset="100%" stopColor={CHART.purple} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CHART.axis }}
            axisLine={false}
            tickLine={false}
            minTickGap={18}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART.axis }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<TooltipCard />} cursor={{ stroke: CHART.grid }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART.purple}
            strokeWidth={2.4}
            fill="url(#radar-area)"
            dot={{ r: 2.6, fill: CHART.purple, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBars({
  data,
  suffix = "stories",
}: {
  data: Array<{ label: string; value: number }>;
  suffix?: string;
}) {
  return (
    <div className="w-full px-2 pb-4" style={{ height: Math.max(150, data.length * 34 + 16) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 24, bottom: 2, left: 6 }}>
          <CartesianGrid stroke={CHART.grid} horizontal={false} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            tick={{ fontSize: 11, fill: CHART.axis }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TooltipCard suffix={suffix} />} cursor={{ fill: "#F6F5FF" }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={CHART.series[index % CHART.series.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformDonut({
  data,
  total,
  totalLabel = "stories",
}: {
  data: Array<{ label: string; value: number }>;
  total: number;
  totalLabel?: string;
}) {
  const sum = data.reduce((accumulator, item) => accumulator + item.value, 0) || 1;

  return (
    <div className="grid items-center gap-4 px-5 pb-5 sm:grid-cols-[178px_1fr]">
      <div className="relative h-[178px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={CHART.series[index % CHART.series.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipCard suffix={totalLabel} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">{total}</span>
          <span className="text-[11px] text-ink-muted">{totalLabel}</span>
        </div>
      </div>

      <ul className="row-list gap-2.5">
        {data.map((entry, index) => (
          <li key={entry.label} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-pill"
              style={{ background: CHART.series[index % CHART.series.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-body font-semibold">{entry.label}</span>
            <span className="shrink-0 text-body font-bold tabular-nums text-ink-muted">
              {Math.round((entry.value / sum) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
