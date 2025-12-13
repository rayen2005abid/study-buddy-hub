import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const courses = [
  { name: "Metacognition & Self-regulation", progress: 78, color: "primary" },
  { name: "Mastering Memory", progress: 65, color: "accent" },
  { name: "Managing Cognitive Load", progress: 45, color: "success" },
  { name: "Procrastination & Boredom", progress: 32, color: "warning" },
  { name: "Motivation & Resilience", progress: 58, color: "primary" },
  { name: "Collaborative Learning", progress: 22, color: "accent" },
  { name: "Time Management & Focus", progress: 85, color: "success" },
];

export function CourseProgress() {
  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{course.name}</span>
              <span className="text-muted-foreground">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
