import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

// --- Type Definitions ---

interface SystemHealth {
  system_performance: {
    posts_processed_today: number;
    current_rate_ppm: number;
    response_time_avg_ms: number;
    classification_accuracy: number;
  };
  data_sources: { name: string; status: string }[];
  network_status: { uptime_percent: number; latency_ms: number; bandwidth_gb: number };
}

interface TimelineEvent {
  time: string;
  incidents: number;
}

interface BackendStatsData {
  by_type: { type: string; count: number }[];
  trending_locations: { location: string; count: number }[];
  timeline: TimelineEvent[];
  system_health: SystemHealth;
}

interface SystemMetricsProps {
  data: SystemHealth;
}
interface TimelineProps {
  data: TimelineEvent[];
}

// --- Child Components ---

const SystemMetrics = ({ data }: SystemMetricsProps) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">🖥️ System Performance</h3>
    <p>Posts Processed: {data.system_performance.posts_processed_today.toLocaleString()}</p>
    <p>Current Rate: {data.system_performance.current_rate_ppm.toLocaleString()} posts/min</p>
    <p>Avg Response Time: {data.system_performance.response_time_avg_ms} ms</p>
    <p>Classification Accuracy: {(data.system_performance.classification_accuracy * 100).toFixed(2)}%</p>
  </Card>
);

const Timeline = ({ data }: TimelineProps) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">⏳ Incident Timeline (Last 24 Hours)</h3>
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', fontSize: '0.85rem' }}
            formatter={(value: number) => [`${value} incidents`, 'Incidents']}
          />
          <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

// --- Main Analytics Component ---

const Analytics = () => {
  const [data, setData] = useState<BackendStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setError(null);
      try {
        const res = await fetch('http://127.0.0.1:5000/api/stats');
        if (!res.ok) throw new Error('Failed to fetch analytics data');
        const json = (await res.json()) as BackendStatsData;
        setData(json);
      } catch (err) {
        setError('Failed to connect to the analysis server.');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground ml-4">Loading Analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p>{error || 'Could not load analytics data.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">📊 Analytics & Metrics</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SystemMetrics data={data.system_health} />
            </div>
            <div>
              <Timeline data={data.timeline} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">🏷️ By Type (Today)</h3>
              <div className="space-y-3">
                {data.by_type.length > 0 ? (
                  data.by_type.map((item) => (
                    <div key={item.type} className="flex justify-between">
                      <span>{item.type}:</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No incidents today.</p>
                )}
              </div>
            </Card>

            <Card className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">📍 Trending Locations (Today)</h3>
              <div className="space-y-3">
                {data.trending_locations.length > 0 ? (
                  data.trending_locations.map((loc, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{loc.location}:</span>
                      <span className="font-bold text-primary">+{loc.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No trending locations.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
