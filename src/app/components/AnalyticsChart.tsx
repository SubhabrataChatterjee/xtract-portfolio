import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsChartRow {
  day: string;
  views: number;
  subscribers: number;
  watchTimeHours: number;
}

export default function AnalyticsChart({
  title,
  dataKey,
  color,
  data,
  unit = "",
}: {
  title: string;
  dataKey: "views" | "subscribers" | "watchTimeHours";
  color: string;
  data: AnalyticsChartRow[];
  unit?: string;
}) {
  const gradientId = `analytics-${dataKey}-fill`;
  const formatAxisValue = (value: number) =>
    Number(value).toLocaleString("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    });

  return (
    <section
      className="min-w-0 rounded-2xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(145deg, rgba(18,25,22,0.94), rgba(10,15,13,0.94))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
      }}
    >
      <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
        {title}
      </h2>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
            <XAxis
              dataKey="day"
              minTickGap={34}
              tickFormatter={(day: string) => day.slice(5).replace("-", "/")}
              tick={{ fill: "#7c8790", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              width={48}
              tickFormatter={formatAxisValue}
              tick={{ fill: "#7c8790", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(day: string) =>
                new Date(`${day}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
              formatter={(value: number) => [
                `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 1 })}${unit}`,
                title,
              ]}
              contentStyle={{
                background: "#111815",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#f1f5f9",
              }}
              labelStyle={{ color: "#9ca3af", marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, strokeWidth: 0, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}