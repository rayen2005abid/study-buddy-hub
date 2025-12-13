import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { updatePreferences } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Camera, Shield, Clock, User, Save, Volume2, Brain } from "lucide-react";

export default function Settings() {
  const [preferences, setPreferences] = useState({
    study_duration_minutes: 25,
    break_duration_minutes: 5,
    theme: "light",
    api_key: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch preferences for mocked student ID 1
    fetch("http://localhost:8000/students/1/preferences")
      .then((res) => res.json())
      .then((data) => {
        setPreferences({
          study_duration_minutes: data.study_duration_minutes,
          break_duration_minutes: data.break_duration_minutes,
          theme: data.theme,
          api_key: data.api_key || "",
        });
      })
      .catch((err) => console.error("Failed to fetch preferences", err));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferences(1, preferences); // Mocked student ID 1
      alert("Settings saved!");
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your FocusFlow experience.
          </p>
        </div>

        {/* AI Configuration */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>Connect to external AI models (Optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key (OpenAI / Gemini)</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={preferences.api_key}
                onChange={(e) => setPreferences({ ...preferences, api_key: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use the built-in offline study coach.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Focus Settings */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Focus Timer
            </CardTitle>
            <CardDescription>Configure your study session preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Focus Duration (minutes)</Label>
                <Select
                  value={preferences.study_duration_minutes.toString()}
                  onValueChange={(val) => setPreferences({ ...preferences, study_duration_minutes: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Break Duration (minutes)</Label>
                <Select
                  value={preferences.break_duration_minutes.toString()}
                  onValueChange={(val) => setPreferences({ ...preferences, break_duration_minutes: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="gradient" size="lg" className="gap-2" onClick={handleSave} disabled={loading}>
            <Save className="h-5 w-5" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
