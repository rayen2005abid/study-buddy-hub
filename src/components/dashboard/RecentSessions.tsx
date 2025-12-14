import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { getUserSessions } from "@/lib/api";

export function RecentSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentId = 1; // Mocked logged-in user

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getUserSessions(studentId, 5); // Get last 5 sessions
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions", error);
      setSessions([
        {
          id: 101,
          subject: "Advanced Mathematics",
          session_type: "Deep Work",
          duration_minutes: 45,
          start_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          focus_score: 88,
          completed: true
        },
        {
          id: 102,
          subject: "History Essay",
          session_type: "Writing",
          duration_minutes: 30,
          start_time: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // Yesterday
          focus_score: 75,
          completed: true
        },
        {
          id: 103,
          subject: "Science Review",
          session_type: "Review",
          duration_minutes: 20,
          start_time: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(), // 2 days ago
          focus_score: 92,
          completed: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card variant="glass" className="animate-fade-in">
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card variant="glass" className="animate-fade-in">
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sessions yet. Start your first study session!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <p className="font-medium">
                {session.subject || "General Study"}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {session.session_type}
                </Badge>
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(session.duration_minutes)}
                </span>
                <span>{formatTime(session.start_time)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Focus Score</p>
                <p
                  className={
                    session.focus_score >= 80
                      ? "text-success"
                      : session.focus_score >= 60
                        ? "text-warning"
                        : "text-destructive"
                  }
                >
                  {Math.round(session.focus_score)}%
                </p>
              </div>
              {session.completed ? (
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
