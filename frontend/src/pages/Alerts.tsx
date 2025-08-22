import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// This interface now matches the data coming from the backend
export interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  disaster_type: string; // The backend sends disaster_type
  primary_location: string;
  timestamp: string;
  report_count: number;
  credibility_score: number;
  text: string;
  all_locations: { coords?: { lat: number; lon: number } }[];
  source_link: string;
  resolved: boolean;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/alerts");
        if (!res.ok) throw new Error("Network response was not ok");
        
        const data: Alert[] = await res.json();
        setAlerts(data || []);

      } catch (err) {
        setError("Failed to connect to the alerts server.");
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // --- FIX: Refresh interval updated to 5 minutes ---
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive", high: "secondary",
      medium: "outline", low: "default",
    } as const;
    return (
      <Badge variant={variants[severity as keyof typeof variants] || "default"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getRelativeTime = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const handleDispatch = (alert: Alert) => {
    toast({
      title: "🚨 Rescue Team Has Been Notified",
      description: `Dispatch initiated for: ${alert.disaster_type} in ${alert.primary_location}`,
    });
  };

  const handleResolve = async (alertId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/alerts/${alertId}/resolve`, {
        method: "POST",
      });
      if (res.ok) {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
        toast({
          title: "✅ Alert Resolved",
          description: "This alert has been marked as resolved.",
        });
      } else {
         throw new Error("Server failed to resolve the alert.");
      }
    } catch (err) {
      console.error("Failed to resolve alert:", err);
      toast({
        title: "❌ Error",
        description: "Could not resolve the alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4">Loading Active Alerts...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">🚨 Active Alerts</h1>
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="font-medium">{alert.disaster_type.toUpperCase()}</span>
                    <span className="text-sm text-muted-foreground">{getRelativeTime(alert.timestamp)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">📍 {alert.primary_location}</div>
                  <div className="text-sm">{alert.text}</div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  <Button variant="secondary" size="sm" onClick={() => handleDispatch(alert)}>Dispatch</Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(alert.source_link, '_blank')}>Details</Button>
                  <Button variant="ghost" size="icon" onClick={() => handleResolve(alert.id)} disabled={alert.resolved}>
                    <Check className={`w-5 h-5 ${alert.resolved ? "text-emerald-500" : "text-muted-foreground"}`} />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <p className="text-lg font-semibold">No Active Alerts</p>
              <p className="text-sm mt-1">The system is monitoring for new incidents.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;