import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", hours: 4.2, sessions: 3 },
  { day: "Tue", hours: 5.8, sessions: 4 },
  { day: "Wed", hours: 3.5, sessions: 2 },
  { day: "Thu", hours: 6.2, sessions: 5 },
  { day: "Fri", hours: 4.8, sessions: 3 },
  { day: "Sat", hours: 2.1, sessions: 2 },
  { day: "Sun", hours: 3.9, sessions: 3 },
];

const courseDistribution = [
  { name: "Memory", value: 28, color: "hsl(243 75% 59%)" },
  { name: "Metacognition", value: 22, color: "hsl(38 92% 50%)" },
  { name: "Focus", value: 20, color: "hsl(142 71% 45%)" },
  { name: "Motivation", value: 15, color: "hsl(280 70% 55%)" },
  { name: "Other", value: 15, color: "hsl(215 20% 55%)" },
];

const sessionHistory = [
  {
    id: 1,
    date: "Today",
    sessions: [
      { subject: "Mastering Memory", duration: "2h 15m", focusScore: 92, time: "10:30 AM" },
      { subject: "Metacognition", duration: "1h 45m", focusScore: 78, time: "2:00 PM" },
    ],
  },
  {
    id: 2,
    date: "Yesterday",
    sessions: [
      { subject: "Time Management", duration: "1h 30m", focusScore: 88, time: "9:00 AM" },
      { subject: "Cognitive Load", duration: "45m", focusScore: 65, time: "4:15 PM" },
      { subject: "Motivation", duration: "1h", focusScore: 82, time: "7:00 PM" },
    ],
  },
  {
    id: 3,
    date: "Dec 11, 2024",
    sessions: [
      { subject: "Memory Techniques", duration: "2h", focusScore: 95, time: "10:00 AM" },
      { subject: "Self-regulation", duration: "1h 15m", focusScore: 74, time: "3:30 PM" },
    ],
  },
];

export default function History() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study History</h1>
            <p className="text-muted-foreground">
              Track your progress and identify patterns in your study habits.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <Clock className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">30.5h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                  <Target className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Focus</p>
                  <p className="text-2xl font-bold">84%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-success">
                  <TrendingUp className="h-6 w-6 text-success-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold text-success">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">22</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="charts">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            {sessionHistory.map((day) => (
              <Card key={day.id} variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-primary" />
                    {day.date}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.sessions.map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{session.subject}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration}
                          </span>
                          <span>{session.time}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          session.focusScore >= 80
                            ? "border-success text-success"
                            : session.focusScore >= 60
                            ? "border-warning text-warning"
                            : "border-destructive text-destructive"
                        }
                      >
                        {session.focusScore}% Focus
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="charts" className="grid gap-6 lg:grid-cols-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Weekly Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 16%)" />
                      <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 8%)",
                          border: "1px solid hsl(222 47% 16%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="hours" fill="hsl(243 75% 59%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Time by Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {courseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 8%)",
                          border: "1px solid hsl(222 47% 16%)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {courseDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
