import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Calendar } from "lucide-react";

const reminders = [
  {
    id: 1,
    title: "Memory Techniques Review",
    time: "Today, 5:00 PM",
    course: "Mastering Memory",
  },
  {
    id: 2,
    title: "Weekly Reflection Session",
    time: "Tomorrow, 9:00 AM",
    course: "Metacognition",
  },
  {
    id: 3,
    title: "Focus Challenge",
    time: "Tomorrow, 2:00 PM",
    course: "Time Management",
  },
];

export function UpcomingReminders() {
  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" />
          Upcoming Reminders
        </CardTitle>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 p-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Calendar className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{reminder.title}</p>
              <p className="text-xs text-muted-foreground">{reminder.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
