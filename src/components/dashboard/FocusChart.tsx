import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", focus: 4.2, target: 5 },
  { day: "Tue", focus: 5.8, target: 5 },
  { day: "Wed", focus: 3.5, target: 5 },
  { day: "Thu", focus: 6.2, target: 5 },
  { day: "Fri", focus: 4.8, target: 5 },
  { day: "Sat", focus: 2.1, target: 5 },
  { day: "Sun", focus: 3.9, target: 5 },
];

export function FocusChart() {
  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Focus Hours</span>
          <span className="text-sm font-normal text-muted-foreground">
            Target: 5h/day
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(222 47% 16%)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="hsl(215 20% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215 20% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 47% 8%)",
                  border: "1px solid hsl(222 47% 16%)",
                  borderRadius: "8px",
                  color: "hsl(210 40% 98%)",
                }}
                formatter={(value: number) => [`${value}h`, "Focus Time"]}
              />
              <Area
                type="monotone"
                dataKey="focus"
                stroke="hsl(243 75% 59%)"
                strokeWidth={2}
                fill="url(#focusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
