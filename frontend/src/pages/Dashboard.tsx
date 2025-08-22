import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";

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
}

interface DashboardData {
  totalIncidents: number;
  resolved: number;
  activeAlerts: number;
  avgResponse: number;
  alerts: Alert[];
}

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState<DashboardData | null>(null);

  // update system clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // fetch dashboard data every second
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/dashboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData(); // initial call
    const interval = setInterval(fetchData, 5 * 60 * 1000);

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

  // helper to format "time ago"
  const getRelativeTime = (timestamp: string) => {
    const alertTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diff = Math.floor((now - alertTime) / 1000); // in seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary">
              🚨 DISASTER ALERT SYSTEM
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                LIVE STATUS: OPERATIONAL
              </span>
              <span>🌍 Global Coverage: ON</span>
              <span>🕐 {currentTime.toUTCString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span>📊 Processing: 2,341 posts/min</span>
            <span>⚡ Latency: 1.2s avg</span>
            <span>🔔 {data?.activeAlerts ?? 0} Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {data?.totalIncidents ?? "--"}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Incidents Today
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-500 mb-2">
                {data?.resolved ?? "--"}
              </div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {data?.activeAlerts ?? "--"}
              </div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {data?.avgResponse ?? "--"}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Response (min)
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Critical Alerts */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">🚨 Recent Critical Alerts</h2>
          <div className="space-y-4">
            {(data?.alerts || []).slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
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
                <div className="text-right text-sm">
                  <div>👥 {alert.reports} reports</div>
                  <div>⭐ {alert.credibility}/10</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
