import { useEffect, useState } from "react";
import { EmergencyMap } from "@/components/EmergencyMap";
import { Navigation } from "@/components/Navigation";

const Map = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/map");
        if (!response.ok) {
          throw new Error("Failed to fetch map data");
        }
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
    // auto-refresh every 1 minute
    const interval = setInterval(fetchMapData, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">
            🗺️ Emergency Map
          </h1>

          {loading ? (
            <p className="text-muted-foreground">Loading map data...</p>
          ) : (
            <div className="h-[calc(100vh-200px)]">
              <EmergencyMap alerts={alerts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Map;
