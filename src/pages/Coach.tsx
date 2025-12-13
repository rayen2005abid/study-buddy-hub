import { useState, useEffect } from "react";
import { chatWithCoach } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, BookOpen, Brain, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  { icon: Brain, text: "How can I improve my memory retention?" },
  { icon: Clock, text: "Tips for managing procrastination?" },
  { icon: Target, text: "How do I stay motivated while studying?" },
  { icon: BookOpen, text: "Best techniques for cognitive load management?" },
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm your AI Study Coach. I'm here to help you improve your study habits based on the principles of metacognition, memory mastery, and cognitive load management. How can I assist you today?",
  },
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Fetch preferences to get API key
    fetch("http://localhost:8000/students/1/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.api_key) setApiKey(data.api_key);
      })
      .catch((err) => console.error("Failed to fetch preferences", err));
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await chatWithCoach(messageText, apiKey);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Study Coach
          </h1>
          <p className="text-muted-foreground">
            Personalized recommendations based on learning science principles.
          </p>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-4">
          {/* Chat Area */}
          <Card variant="glass" className="lg:col-span-3 flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        message.role === "assistant"
                          ? "gradient-primary"
                          : "bg-secondary"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[80%]",
                        message.role === "assistant"
                          ? "bg-secondary"
                          : "gradient-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-2xl bg-secondary px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your AI coach..."
                  className="flex-1"
                />
                <Button type="submit" variant="gradient" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Suggested Questions */}
          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleSend(q.text)}
                  >
                    <q.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                    <span className="text-sm">{q.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Your Courses</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {[
                  "Metacognition",
                  "Memory",
                  "Cognitive Load",
                  "Motivation",
                  "Time Management",
                ].map((course) => (
                  <Badge key={course} variant="secondary" className="text-xs">
                    {course}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
