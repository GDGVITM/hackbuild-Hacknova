import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { AlertCircle, Loader2 } from "lucide-react";

// --- Type Definitions ---
interface BackendIncident {
  id: string;
  severity: string;
  disaster_type: string;
  primary_location: string;
  timestamp: string;
  report_count: number;
  credibility_score: number;
  text: string;
  all_locations: {
    coords?: {
      lat: number;
      lon: number;
    };
  }[];
}

interface BackendData {
  overview: {
    totalIncidents: number;
    resolved: number;
    activeAlerts: number;
    avgResponse: number;
  };
  todays_incidents: BackendIncident[];
}

export interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  location: string;
  time: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update system clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch and transform dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/dashboard");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const backendData = (await res.json()) as BackendData;

        // ✅ Sort incidents by most recent timestamp first
        const sortedIncidents = backendData.todays_incidents.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const transformedData: DashboardData = {
          totalIncidents: backendData.overview.totalIncidents,
          resolved: backendData.overview.resolved,
          activeAlerts: backendData.overview.activeAlerts,
          avgResponse: backendData.overview.avgResponse * 60,
          alerts: sortedIncidents.map((incident) => ({
            id: incident.id,
            severity: incident.severity.toLowerCase() as Alert["severity"],
            title: incident.disaster_type.toUpperCase(),
            location: incident.primary_location,
            time: incident.timestamp,
            reports: incident.report_count,
            credibility: incident.credibility_score * 10,
            description: incident.text,
            coordinates: [
              incident.all_locations[0]?.coords?.lat || 0,
              incident.all_locations[0]?.coords?.lon || 0,
            ],
          })),
        };
        setData(transformedData);
      } catch (err) {
        setError("Failed to connect to the analysis server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: Alert["severity"]) => {
    const variants = {
      critical: "destructive",
      high: "secondary",
      medium: "outline",
      low: "default",
    } as const;
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getRelativeTime = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">
          Connecting to Disaster Alert System...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center text-destructive bg-background">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Connection Error</h2>
        <p>{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Ensure the backend server is running and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <header className="border-b border-border bg-card/50 px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              🚨 DISASTER ALERT SYSTEM
            </h1>
            <div className="flex flex-wrap items-center text-sm mt-2 sm:mt-0 space-x-4 text-muted-foreground">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                LIVE STATUS: OPERATIONAL
              </span>
              <span className="hidden md:inline">🕐 {currentTime.toUTCString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-orange-500">
              🔔 {data?.activeAlerts ?? 0} Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              {data?.totalIncidents ?? "--"}
            </div>
            <div className="text-sm text-muted-foreground">Total Incidents Today</div>
          </Card>
          <Card className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-500 mb-2">
              {data?.resolved ?? "--"}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </Card>
          <Card className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-2">
              {data?.activeAlerts ?? "--"}
            </div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </Card>
          <Card className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-2">
              {data?.avgResponse?.toFixed(1) ?? "--"}
            </div>
            <div className="text-sm text-muted-foreground">Avg Response (min)</div>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            🚨 Most Recent Alerts
          </h2>
          <div className="space-y-4">
            {data && data.alerts.length > 0 ? (
              data.alerts.slice(0, 5).map((alert) => (
                <a
                  key={alert.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${alert.coordinates[0]},${alert.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getSeverityBadge(alert.severity)}
                        <span className="font-medium">{alert.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {getRelativeTime(alert.time)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        📍 {alert.location}
                      </div>
                      <p className="text-sm">{alert.description}</p>
                    </div>
                    <div className="text-right text-sm sm:ml-4">
                      <div>👥 {alert.reports} reports</div>
                      <div>⭐ {alert.credibility.toFixed(1)}/10</div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm sm:text-base">
                <p>No incidents reported today. System is monitoring.</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
