import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FocusChart } from "@/components/dashboard/FocusChart";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { CourseProgress } from "@/components/dashboard/CourseProgress";
import { Clock, Target, Flame, Brain, Sparkles } from "lucide-react";
import { getUserStats, getUserInsights } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = 1; // Mocked logged-in user

  useEffect(() => {
    loadPersonalizedData();
  }, []);

  const loadPersonalizedData = async () => {
    try {
      const [statsData, insightsData] = await Promise.all([
        getUserStats(studentId),
        getUserInsights(studentId)
      ]);

      setStats(statsData);
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error("Failed to load personalized data", error);
      // Set default values if API fails
      setStats({
        total_study_time_hours: 42,
        this_week_hours: 12.5,
        average_focus_score: 87,
        current_streak_days: 5,
        total_sessions: 24,
        this_week_sessions: 8,
        focus_improvement_percent: 15
      });
      setInsights([
        "Great consistency in morning sessions!",
        "Your distraction rate dropped by 15% this week.",
        "You focus best between 9 AM and 11 AM."
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading your personalized dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, <span className="gradient-text">Student</span>
          </h1>
          <p className="text-muted-foreground">
            {stats.current_streak_days > 0
              ? `You're on a ${stats.current_streak_days}-day streak! Keep it going! 🔥`
              : "Your focus journey continues. Let's make today count."}
          </p>
        </div>

        {/* Personalized Insights */}
        {insights.length > 0 && (
          <Card variant="glow" className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">
                    {i + 1}
                  </Badge>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Study Time"
            value={`${stats.total_study_time_hours}h`}
            subtitle="All time"
            icon={Clock}
            trend={stats.this_week_hours > 0 ? {
              value: Math.round((stats.this_week_hours / stats.total_study_time_hours) * 100),
              positive: true
            } : undefined}
            variant="primary"
          />
          <StatsCard
            title="Focus Score"
            value={`${Math.round(stats.average_focus_score)}%`}
            subtitle="Average"
            icon={Target}
            trend={stats.focus_improvement_percent !== 0 ? {
              value: Math.abs(stats.focus_improvement_percent),
              positive: stats.focus_improvement_percent > 0
            } : undefined}
            variant="accent"
          />
          <StatsCard
            title="Study Streak"
            value={stats.current_streak_days > 0 ? `${stats.current_streak_days} days` : "Start today!"}
            subtitle={stats.current_streak_days > 0 ? "Keep it going!" : "Begin your journey"}
            icon={Flame}
            variant="success"
          />
          <StatsCard
            title="Sessions Completed"
            value={stats.total_sessions.toString()}
            subtitle={`${stats.this_week_sessions} this week`}
            icon={Brain}
            trend={stats.this_week_sessions > 0 ? {
              value: stats.this_week_sessions,
              positive: true
            } : undefined}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FocusChart />
          </div>
          <div className="space-y-6">
            <UpcomingReminders />
          </div>
        </div>

        {/* Recent Sessions and Course Progress */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentSessions />
          <CourseProgress />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
