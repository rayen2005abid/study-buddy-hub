import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ShieldOff,
  Chrome,
  MessageCircle,
  Music,
  Gamepad2,
  Video,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppData {
  id: string;
  name: string;
  icon: typeof Chrome;
  category: "productive" | "neutral" | "distracting";
  blocked: boolean;
  timeSpent: number;
  limit: number;
}

const apps: AppData[] = [
  { id: "1", name: "Chrome", icon: Chrome, category: "neutral", blocked: false, timeSpent: 45, limit: 120 },
  { id: "2", name: "Discord", icon: MessageCircle, category: "distracting", blocked: true, timeSpent: 30, limit: 30 },
  { id: "3", name: "Spotify", icon: Music, category: "neutral", blocked: false, timeSpent: 60, limit: 180 },
  { id: "4", name: "Steam", icon: Gamepad2, category: "distracting", blocked: true, timeSpent: 0, limit: 30 },
  { id: "5", name: "YouTube", icon: Video, category: "distracting", blocked: false, timeSpent: 25, limit: 45 },
];

export default function Apps() {
  const [appList, setAppList] = useState(apps);
  const [focusModeActive, setFocusModeActive] = useState(false);

  const toggleBlock = (id: string) => {
    setAppList((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, blocked: !app.blocked } : app
      )
    );
  };

  const getCategoryColor = (category: AppData["category"]) => {
    switch (category) {
      case "productive":
        return "text-success border-success/30 bg-success/10";
      case "neutral":
        return "text-muted-foreground border-border bg-secondary/50";
      case "distracting":
        return "text-destructive border-destructive/30 bg-destructive/10";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">App Tracker</h1>
            <p className="text-muted-foreground">
              Monitor and block distracting applications during study sessions.
            </p>
          </div>
          <Button
            variant={focusModeActive ? "destructive" : "gradient"}
            size="lg"
            onClick={() => setFocusModeActive(!focusModeActive)}
            className="gap-2"
          >
            {focusModeActive ? (
              <>
                <ShieldOff className="h-5 w-5" />
                Disable Focus Mode
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Enable Focus Mode
              </>
            )}
          </Button>
        </div>

        {/* Focus Mode Banner */}
        {focusModeActive && (
          <Card variant="glow" className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Focus Mode Active</h3>
                <p className="text-sm text-muted-foreground">
                  Distracting apps are blocked. Stay focused on your studies!
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">45:23</p>
                <p className="text-xs text-muted-foreground">Session Time</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card variant="glass">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Apps Blocked</p>
              <p className="text-3xl font-bold">{appList.filter((a) => a.blocked).length}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Screen Time</p>
              <p className="text-3xl font-bold">2h 40m</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Blocked Attempts</p>
              <p className="text-3xl font-bold text-destructive">12</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Focus Score</p>
              <p className="text-3xl font-bold text-success">89%</p>
            </CardContent>
          </Card>
        </div>

        {/* App List */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Application Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appList.map((app) => (
              <div
                key={app.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 transition-all",
                  app.blocked ? "border-destructive/30 bg-destructive/5" : "border-border bg-secondary/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    getCategoryColor(app.category)
                  )}
                >
                  <app.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{app.name}</p>
                    <Badge variant="outline" className={getCategoryColor(app.category)}>
                      {app.category}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {app.timeSpent}m / {app.limit}m limit
                      </span>
                      {app.timeSpent >= app.limit && (
                        <span className="flex items-center gap-1 text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          Limit reached
                        </span>
                      )}
                    </div>
                    <Progress
                      value={(app.timeSpent / app.limit) * 100}
                      className={cn(
                        "h-1.5",
                        app.timeSpent >= app.limit && "[&>div]:bg-destructive"
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {app.blocked ? (
                      <Lock className="h-4 w-4 text-destructive" />
                    ) : (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={app.blocked}
                      onCheckedChange={() => toggleBlock(app.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
