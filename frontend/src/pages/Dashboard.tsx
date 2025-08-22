import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { AlertCircle, Loader2 } from "lucide-react"; // Icons for loading/error states

// --- Type Definitions ---

// This interface matches the raw data from your Python backend
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

// This interface matches the JSON structure from the /api/dashboard endpoint
interface BackendData {
  overview: {
    totalIncidents: number;
    resolved: number;
    activeAlerts: number;
    avgResponse: number;
  };
  todays_incidents: BackendIncident[];
}

// This is the shape of the data after we transform it for our components
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

// --- Component ---

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update system clock every second
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
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const backendData = (await res.json()) as BackendData;

        // Transform backend data to match frontend's expected structure
        const transformedData: DashboardData = {
          totalIncidents: backendData.overview.totalIncidents,
          resolved: backendData.overview.resolved,
          activeAlerts: backendData.overview.activeAlerts,
          avgResponse: backendData.overview.avgResponse * 60, // Convert hours to minutes
          alerts: backendData.todays_incidents.map(
            (incident: BackendIncident) => ({
              id: incident.id,
              severity: incident.severity.toLowerCase() as Alert["severity"],
              title: incident.disaster_type.toUpperCase(),
              location: incident.primary_location,
              time: incident.timestamp,
              reports: incident.report_count,
              credibility: incident.credibility_score * 10, // Convert to 0-10 scale
              description: incident.text,
              coordinates: [
                incident.all_locations[0]?.coords?.lat || 0,
                incident.all_locations[0]?.coords?.lon || 0,
              ],
            })
          ),
        };
        setData(transformedData);
      } catch (err) {
        setError("Failed to connect to the analysis server.");
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial call
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: Alert["severity"]) => {
    const variants = {
      critical: "destructive", high: "secondary",
      medium: "outline", low: "default",
    } as const;
    return (
      <Badge variant={variants[severity] || "default"}>
        {severity.toUpperCase()}
      </Badge>
    );
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Connecting to Disaster Alert System...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p>{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please ensure the backend server is running and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary">
              🚨 DISASTER ALERT SYSTEM
            </h1>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                LIVE STATUS: OPERATIONAL
              </span>
              <span>🕐 {currentTime.toUTCString()}</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <span>📊 Processing: 2,341 posts/min</span>
            <span>⚡ Latency: 1.2s avg</span>
            <span className="font-bold text-orange-500">
              🔔 {data?.activeAlerts ?? 0} Active
            </span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{data?.totalIncidents ?? "--"}</div>
            <div className="text-sm text-muted-foreground">Total Incidents Today</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-500 mb-2">{data?.resolved ?? "--"}</div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">{data?.activeAlerts ?? "--"}</div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{data?.avgResponse?.toFixed(1) ?? "--"}</div>
            <div className="text-sm text-muted-foreground">Avg Response (min)</div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">🚨 Recent Alerts Today</h2>
          <div className="space-y-4">
            {data && data.alerts.length > 0 ? (
              data.alerts.slice(0, 5).map((alert) => (
                <a
                  key={alert.id}
                  href={`https://www.google.com/maps/search/?api=1&query=${alert.coordinates[0]},${alert.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                        {getSeverityBadge(alert.severity)}
                        <span className="font-medium">{alert.title}</span>
                        <span className="text-sm text-muted-foreground">{getRelativeTime(alert.time)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">📍 {alert.location}</div>
                      <p className="text-sm">{alert.description}</p>
                    </div>
                    <div className="text-right text-sm ml-4">
                      <div>👥 {alert.reports} reports</div>
                      <div>⭐ {alert.credibility.toFixed(1)}/10</div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
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