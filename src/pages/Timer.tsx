import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings2, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
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

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
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
            onClick={() => {
              setMode("focus");
              setTimeLeft(FOCUS_TIME);
              setIsRunning(false);
            }}
          >
            Focus Mode
          </Button>
          <Button
            variant={mode === "break" ? "accent" : "ghost"}
            size="lg"
            onClick={() => {
              setMode("break");
              setTimeLeft(BREAK_TIME);
              setIsRunning(false);
            }}
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
                <p className="text-2xl font-bold text-primary">4</p>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">2h 15m</p>
                <p className="text-sm text-muted-foreground">Total Focus</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">87%</p>
                <p className="text-sm text-muted-foreground">Focus Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
