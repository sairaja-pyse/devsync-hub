import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Your name" defaultValue="DevSync User" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="your@email.com" defaultValue="user@devsync.app" />
          </div>
        </div>
        <Button size="sm">Save Changes</Button>
      </div>

      {/* Theme */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                theme === t.value
                  ? "border-primary bg-accent"
                  : "border-transparent bg-secondary hover:border-border"
              )}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Account</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm">Change Password</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
