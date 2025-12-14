import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { startSession, completeSession } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const studentId = 1; // Mocked logged-in user

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed naturally
      handleSessionComplete(true);

      // Switch modes
      if (mode === "focus") {
        setMode("break");
        setTimeLeft(BREAK_TIME);
      } else {
        setMode("focus");
        setTimeLeft(FOCUS_TIME);
      }
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = async () => {
    if (!isRunning) {
      // Starting timer - create session
      try {
        const response = await startSession(studentId, mode);
        setCurrentSessionId(response.session_id);
        setSessionStartTime(Date.now());
        setIsRunning(true);

        toast({
          title: mode === "focus" ? "Focus Session Started" : "Break Started",
          description: "Your session is being tracked. Stay focused!",
        });
      } catch (error) {
        console.error("Failed to start session", error);
        toast({
          title: "Error",
          description: "Failed to start session tracking. Session will run locally.",
          variant: "destructive",
        });
        setIsRunning(true); // Still allow timer to run
      }
    } else {
      // Pausing timer
      setIsRunning(false);
    }
  };

  const handleSessionComplete = async (completed: boolean) => {
    if (currentSessionId) {
      const durationMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
      const targetDuration = mode === "focus" ? 25 : 5;
      const focusScore = completed ? Math.min(95, 70 + Math.random() * 25) : 50; // Simulated focus score

      try {
        await completeSession(currentSessionId, {
          focus_score: focusScore,
          duration_minutes: durationMinutes,
          distractions_count: 0,
          completed: completed,
        });

        if (completed) {
          toast({
            title: "Session Completed! 🎉",
            description: `Great job! You completed a ${targetDuration}-minute ${mode} session.`,
          });
        }
      } catch (error) {
        console.error("Failed to complete session", error);
      }

      setCurrentSessionId(null);
    }
  };

  const resetTimer = () => {
    if (isRunning && currentSessionId) {
      // Complete session as incomplete
      handleSessionComplete(false);
    }

    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
    setCurrentSessionId(null);
  };

  const switchMode = (newMode: "focus" | "break") => {
    if (isRunning && currentSessionId) {
      handleSessionComplete(false);
    }

    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
    setIsRunning(false);
    setCurrentSessionId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = mode === "focus"
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-8">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          <Button
            variant={mode === "focus" ? "gradient" : "ghost"}
            size="lg"
            onClick={() => switchMode("focus")}
            disabled={isRunning}
          >
            Focus Mode
          </Button>
          <Button
            variant={mode === "break" ? "accent" : "ghost"}
            size="lg"
            onClick={() => switchMode("break")}
            disabled={isRunning}
          >
            Break Time
          </Button>
        </div>

        {/* Timer Circle */}
        <div className="relative">
          <div
            className={cn(
              "flex h-80 w-80 items-center justify-center rounded-full border-4 transition-all duration-500",
              mode === "focus"
                ? "border-primary/30 bg-primary/5"
                : "border-accent/30 bg-accent/5",
              isRunning && (mode === "focus" ? "glow-primary" : "glow-accent")
            )}
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="156"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className={cn(
                  "transition-all duration-300",
                  mode === "focus" ? "text-primary" : "text-accent"
                )}
                strokeDasharray={`${(progress / 100) * 980} 980`}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <p className="text-6xl font-bold tracking-tight">
                {formatTime(timeLeft)}
              </p>
              <p className="text-muted-foreground mt-2 text-lg capitalize">
                {mode === "focus" ? "Stay Focused" : "Take a Break"}
              </p>
              {currentSessionId && (
                <p className="text-xs text-primary mt-1">● Tracking</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant={mode === "focus" ? "gradient" : "accent"}
            size="xl"
            onClick={toggleTimer}
            className="gap-2 min-w-[160px]"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Session Stats */}
        <Card variant="glass" className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {currentSessionId ? "Active" : "Ready"}
                </p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {mode === "focus" ? "25 min" : "5 min"}
                </p>
                <p className="text-sm text-muted-foreground">Target</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">Tracking</p>
                <p className="text-sm text-muted-foreground">Personalized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
