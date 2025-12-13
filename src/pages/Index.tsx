import { Layout } from "@/components/layout/Layout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FocusChart } from "@/components/dashboard/FocusChart";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { UpcomingReminders } from "@/components/dashboard/UpcomingReminders";
import { CourseProgress } from "@/components/dashboard/CourseProgress";
import { Clock, Target, Flame, Brain } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Good afternoon, <span className="gradient-text">Student</span>
          </h1>
          <p className="text-muted-foreground">
            Your focus journey continues. Let's make today count.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Study Time"
            value="24.5h"
            subtitle="This week"
            icon={Clock}
            trend={{ value: 12, positive: true }}
            variant="primary"
          />
          <StatsCard
            title="Focus Score"
            value="87%"
            subtitle="Average this week"
            icon={Target}
            trend={{ value: 5, positive: true }}
            variant="accent"
          />
          <StatsCard
            title="Study Streak"
            value="12 days"
            subtitle="Keep it going!"
            icon={Flame}
            variant="success"
          />
          <StatsCard
            title="Sessions Completed"
            value="18"
            subtitle="This week"
            icon={Brain}
            trend={{ value: 8, positive: true }}
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
