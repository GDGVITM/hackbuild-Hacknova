import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  location: string;
  time: string; // ISO string from backend
  reports: number;
  credibility: number;
  description: string;
  coordinates: [number, number];
  details_url: string;
  status: "active" | "resolved";
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/alerts");
        const data = await res.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "secondary",
      medium: "outline",
      low: "default",
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || "default"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    return `${diffHrs}h ago`;
  };

  const handleDispatch = (alert: Alert) => {
    toast({
      title: "🚨 Rescue Team Has Been Notified",
      description: `Dispatch initiated for: ${alert.title}`,
    });
  };

  const handleResolve = async (alertId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/alerts/${alertId}/resolve`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updated.alert : a))
        );
        toast({
          title: "✅ Alert Resolved",
          description: "This alert has been marked as resolved.",
        });
      }
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          🚨 Active Alerts
        </h1>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="font-medium">{alert.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {getRelativeTime(alert.time)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  📍 {alert.location}
                </div>
                <div className="text-sm">{alert.description}</div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDispatch(alert)}
                >
                  Dispatch
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = alert.details_url)}
                >
                  Details
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleResolve(alert.id)}
                  disabled={alert.status === "resolved"}
                >
                  <Check
                    className={`w-5 h-5 ${
                      alert.status === "resolved"
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
