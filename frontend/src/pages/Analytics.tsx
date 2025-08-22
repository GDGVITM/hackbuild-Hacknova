// src/Analytics.tsx
import { useEffect, useState } from 'react';
import { SystemMetrics } from '@/components/SystemMetrics';
import { Timeline } from '@/components/Timeline';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';

interface Overview {
  total_incidents: number;
  resolved: number;
  active: number;
  avg_response_time: number;
}

interface ByTypeItem {
  count: number;
  percent: number;
}

interface TrendingLocation {
  name: string;
  increase: number;
}

interface AnalyticsData {
  overview: Overview;
  by_type: Record<string, ByTypeItem>;
  trending_locations: TrendingLocation[];
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 1000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">
            📊 Analytics & Metrics
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <div>
              <SystemMetrics />
            </div>

            {/* Timeline */}
            <div>
              <Timeline />
            </div>
          </div>

          {/* Additional Analytics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Overview */}
            <Card className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">📈 Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Incidents:</span>
                  <span className="font-bold">{data.overview.total_incidents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-bold text-emerald-500">
                    {data.overview.resolved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-bold text-orange-500">
                    {data.overview.active}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response Time:</span>
                  <span className="font-bold">
                    {data.overview.avg_response_time} min
                  </span>
                </div>
              </div>
            </Card>

            {/* By Type */}
            <Card className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">🏷️ By Type</h3>
              <div className="space-y-3">
                {Object.entries(data.by_type).map(([type, stats]) => (
                  <div key={type} className="flex justify-between">
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                    <span>
                      {stats.count} ({stats.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending Locations */}
            <Card className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">📍 Trending Locations</h3>
              <div className="space-y-3">
                {data.trending_locations.map((loc, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{loc.name}:</span>
                    <span className="text-orange-500">+{loc.increase}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
