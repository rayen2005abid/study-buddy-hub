import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";

const sessions = [
  {
    id: 1,
    subject: "Metacognition & Self-regulation",
    duration: "2h 15m",
    focusScore: 92,
    status: "completed",
    time: "Today, 10:30 AM",
  },
  {
    id: 2,
    subject: "Mastering Memory",
    duration: "1h 45m",
    focusScore: 78,
    status: "completed",
    time: "Today, 2:00 PM",
  },
  {
    id: 3,
    subject: "Managing Cognitive Load",
    duration: "45m",
    focusScore: 45,
    status: "interrupted",
    time: "Yesterday, 4:15 PM",
  },
  {
    id: 4,
    subject: "Time Management and Focus",
    duration: "1h 30m",
    focusScore: 88,
    status: "completed",
    time: "Yesterday, 7:00 PM",
  },
];

export function RecentSessions() {
  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader>
        <CardTitle>Recent Study Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium">{session.subject}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.duration}
                </span>
                <span>{session.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Focus Score</p>
                <p
                  className={
                    session.focusScore >= 80
                      ? "text-success"
                      : session.focusScore >= 60
                      ? "text-warning"
                      : "text-destructive"
                  }
                >
                  {session.focusScore}%
                </p>
              </div>
              {session.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
