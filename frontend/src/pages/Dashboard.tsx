import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  location: string;
  time: string;
  reports: number;
  credibility: number;
  description: string;
  coordinates: [number, number];
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Building Collapse',
    location: 'Downtown Mumbai, Maharashtra',
    time: '2 mins ago',
    reports: 15,
    credibility: 9.2,
    description: 'Multi-story building collapsed on Main Street',
    coordinates: [19.0760, 72.8777]
  },
  {
    id: '2',
    severity: 'high',
    title: 'Flash Flood Warning',
    location: 'Austin, Texas, USA',
    time: '7 mins ago',
    reports: 8,
    credibility: 8.7,
    description: 'Water level rising rapidly near I-35 underpass',
    coordinates: [30.2672, -97.7431]
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Power Outage',
    location: 'Brooklyn, New York, USA',
    time: '12 mins ago',
    reports: 23,
    credibility: 7.8,
    description: 'Large scale power outage affecting multiple neighborhoods',
    coordinates: [40.6782, -73.9442]
  }
];

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'secondary',
      medium: 'outline',
      low: 'default'
    } as const;
    
    return <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
      {severity.toUpperCase()}
    </Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary">🚨 DISASTER ALERT SYSTEM</h1>
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
            <span>🔔 {mockAlerts.length} Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">284</div>
              <div className="text-sm text-muted-foreground">Total Incidents Today</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-500 mb-2">261</div>
              <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">23</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">3.2</div>
              <div className="text-sm text-muted-foreground">Avg Response (min)</div>
            </div>
          </Card>
        </div>

        {/* Recent Critical Alerts */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">🚨 Recent Critical Alerts</h2>
          <div className="space-y-4">
            {mockAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="font-medium">{alert.title}</span>
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">📍 {alert.location}</div>
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