import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Video,
  MessageCircle,
  Plus,
  Clock,
  BookOpen,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studySessions = [
  {
    id: 1,
    title: "Memory Techniques Study Group",
    course: "Mastering Memory",
    host: "Alex Chen",
    participants: 8,
    maxParticipants: 12,
    startTime: "5:00 PM",
    duration: "2 hours",
    active: true,
  },
  {
    id: 2,
    title: "Metacognition Deep Dive",
    course: "Metacognition & Self-regulation",
    host: "Sarah Kim",
    participants: 5,
    maxParticipants: 8,
    startTime: "7:00 PM",
    duration: "1.5 hours",
    active: false,
  },
  {
    id: 3,
    title: "Focus & Productivity Workshop",
    course: "Time Management and Focus",
    host: "Mike Johnson",
    participants: 15,
    maxParticipants: 20,
    startTime: "Tomorrow, 10:00 AM",
    duration: "3 hours",
    active: false,
  },
];

const discordRooms = [
  { name: "HIDE Study Hall", members: 234, link: "https://discord.com/channels/1281183199380246570/1281212568471339008" },
  { name: "General Discussion", members: 89, link: "https://discord.com/channels/1281183199380246570/1281212568471339008" },
  { name: "Focus Zone (Silent)", members: 156, link: "https://discord.com/channels/1281183199380246570/1281212568471339008" },
  { name: "Exam Prep & Support", members: 67, link: "https://discord.com/channels/1281183199380246570/1281212568471339008" },
];

const activeStudiers = [
  { name: "Rayen Abid", course: "Computer Science", avatar: "" },
  { name: "Omar Agrebi", course: "Data Science", avatar: "" },
  { name: "Razi Hmaied", course: "Cybersecurity", avatar: "" },
  { name: "Ismail Shili", course: "Artificial Intelligence", avatar: "" },
  { name: "Seifallah Abiriga", course: "Software Engineering", avatar: "" },
];

export default function Collaborate() {
  const { toast } = useToast();

  const handleCreateSession = () => {
    toast({
      title: "Create Study Session",
      description: "Session creation feature coming soon! You'll be able to schedule and host study sessions.",
    });
  };

  const handleJoinSession = (sessionTitle: string) => {
    toast({
      title: "Joining Session",
      description: `Connecting you to "${sessionTitle}"...`,
    });
  };

  const handleSetReminder = (sessionTitle: string, time: string) => {
    toast({
      title: "Reminder Set",
      description: `You'll be notified before "${sessionTitle}" starts at ${time}.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Together</h1>
            <p className="text-muted-foreground">
              Connect with fellow students and learn collaboratively.
            </p>
          </div>
          <Button variant="gradient" size="lg" className="gap-2" onClick={handleCreateSession}>
            <Plus className="h-5 w-5" />
            Create Session
          </Button>
        </div>

        {/* Active Studiers Banner */}
        <Card variant="glass" className="border-success/20 bg-success/5">
          <CardContent className="flex items-center gap-6 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-success">
              <Users className="h-6 w-6 text-success-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">42 Students Studying Now</h3>
              <p className="text-sm text-muted-foreground">
                Join them in a collaborative study session
              </p>
            </div>
            <div className="flex -space-x-2">
              {activeStudiers.map((user, i) => (
                <Avatar
                  key={i}
                  className="h-10 w-10 border-2 border-background"
                >
                  <AvatarFallback className="bg-primary/20 text-xs">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-medium">
                +37
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Study Sessions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search study sessions..." className="pl-10" />
              </div>
            </div>

            <div className="space-y-4">
              {studySessions.map((session) => (
                <Card
                  key={session.id}
                  variant={session.active ? "glow" : "glass"}
                  className={cn(
                    "transition-all hover:scale-[1.01]",
                    session.active && "border-primary/30"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {session.active && (
                            <Badge variant="default" className="gradient-primary animate-pulse">
                              Live
                            </Badge>
                          )}
                          <h3 className="font-semibold text-lg">{session.title}</h3>
                        </div>
                        <Badge variant="outline">{session.course}</Badge>
                        <p className="text-sm text-muted-foreground">
                          Hosted by {session.host}
                        </p>
                      </div>
                      <Button
                        variant={session.active ? "gradient" : "secondary"}
                        onClick={() => session.active ? handleJoinSession(session.title) : handleSetReminder(session.title, session.startTime)}
                      >
                        {session.active ? (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Join Now
                          </>
                        ) : (
                          "Set Reminder"
                        )}
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.participants}/{session.maxParticipants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {session.duration}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Discord Rooms */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Discord Study Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {discordRooms.map((room) => (
                  <a
                    key={room.name}
                    href={room.link}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.members} online
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  View All Rooms
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Study Buddies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeStudiers.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-xs">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Studying {user.course}
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
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
