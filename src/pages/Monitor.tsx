import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FocusTracker from "@/components/FocusTracker";

export default function Monitor() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus Monitor</h1>
          <p className="text-muted-foreground">
            AI-powered attention tracking to help you stay focused.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Camera Feed */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Camera Feed & Focus AI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-full min-h-[400px]">
                <FocusTracker className="w-full h-full shadow-none border-0" />
              </div>
            </CardContent>
          </Card>

          {/* Detection Stats */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Session Duration</span>
                  <span className="font-semibold">00:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Focus Score</span>
                  <span className="font-semibold text-success">Tracking...</span>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Detection Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Face Detection", active: true },
                  { label: "Head Pose Estimation", active: true },
                  { label: "Phone Detection", active: false },
                  { label: "Voice Alerts", active: true },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                  >
                    <span className="text-sm">{feature.label}</span>
                    <Badge variant={feature.active ? "default" : "secondary"}>
                      {feature.active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
