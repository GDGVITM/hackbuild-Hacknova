import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, MapPin, Users, Clock, Target, Activity, Zap, Globe, Settings, User, RefreshCw } from 'lucide-react';
import { EmergencyMap } from './EmergencyMap';
import { SystemMetrics } from './SystemMetrics';
import { AlertPanel } from './AlertPanel';
import { Timeline } from './Timeline';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'resolved';
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
    coordinates: [72.8777, 19.0760]
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
    coordinates: [-97.7431, 30.2672]
  },
  {
    id: '3',
    severity: 'medium',
    title: 'Power Outage',
    location: 'Brooklyn, New York, USA',
    time: '12 mins ago',
    reports: 23,
    credibility: 7.8,
    description: 'Widespread power outage affecting multiple districts',
    coordinates: [-73.9442, 40.6782]
  },
  {
    id: '4',
    severity: 'low',
    title: 'Traffic Accident',
    location: 'London, UK',
    time: '18 mins ago',
    reports: 5,
    credibility: 6.5,
    description: 'Multi-vehicle accident on M25 motorway',
    coordinates: [-0.1278, 51.5074]
  }
];

export function DisasterDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [filters, setFilters] = useState({
    timeRange: 'hour',
    types: ['fire', 'flood', 'earthquake', 'weather', 'accident', 'infrastructure'],
    credibilityThreshold: [7.0],
    languages: ['english', 'hindi']
  });

  // ✅ Dashboard summary state
  const [summary, setSummary] = useState({
    totalIncidents: 0,
    resolved: 0,
    active: 0,
    avgResponse: 0,
  });

  // Clock updater
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch dashboard summary from backend
  const fetchDashboard = async () => {
  try {
      const res = await fetch("http://127.0.0.1:6000/api/dashboard");
      const json = await res.json();
      console.log("Fetched dashboard:", json); // 👈 add this
      setSummary({
        totalIncidents: json.totalIncidents,
        resolved: json.resolved,
        active: json.activeAlerts,
        avgResponse: json.avgResponse,
      });
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };


  // ✅ Auto-refresh every 5 mins
  useEffect(() => {
    fetchDashboard(); // initial fetch
    const interval = setInterval(fetchDashboard, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'UTC',
      hour12: false 
    }) + ' UTC';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Bar */}
      <header className="h-20 bg-card border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-alert-critical" />
            <h1 className="text-2xl font-bold">DISASTER ALERT SYSTEM</h1>
          </div>
          <div className="flex items-center space-x-6 text-sm font-mono">
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-operational"></div>
              <span>LIVE STATUS: OPERATIONAL</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Global Coverage: ON</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last Update: {formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm font-mono">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Processing: 2,341 posts/min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Latency: 1.2s avg</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Accuracy: 89.2%</span>
          </div>
          <Badge variant="secondary" className="bg-alert-critical text-white">
            {summary.active} Active
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left Sidebar */}
        <div className="w-[350px] border-r border-border flex flex-col">
          {/* Active Alerts */}
          <div className="h-[400px] p-4">
            <AlertPanel alerts={alerts} />
          </div>
          
          {/* Filters & Controls */}
          <div className="flex-1 p-4 border-t border-border overflow-y-auto scrollbar-thin">
            <Card className="command-panel p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                INCIDENT FILTERS
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input placeholder="Location/Keywords" className="font-mono text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['15 mins', 'Hour', '6 Hours', '24 Hours'].map((range) => (
                    <Button
                      key={range}
                      variant={filters.timeRange === range.toLowerCase() ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setFilters({...filters, timeRange: range.toLowerCase()})}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Disaster Types</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'fire', label: '🔥 Fire/Explosion' },
                    { id: 'flood', label: '🌊 Flood/Water' },
                    { id: 'earthquake', label: '🌍 Earthquake' },
                    { id: 'weather', label: '⛈️ Severe Weather' },
                    { id: 'accident', label: '🚗 Accident/Crash' },
                    { id: 'infrastructure', label: '🏗️ Infrastructure' }
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox id={type.id} defaultChecked />
                      <label htmlFor={type.id} className="text-xs">{type.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Credibility Threshold: {filters.credibilityThreshold[0]}
                </label>
                <Slider
                  value={filters.credibilityThreshold}
                  onValueChange={(value) => setFilters({...filters, credibilityThreshold: value})}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Reset Filters
                </Button>
                <Button variant="default" size="sm" className="flex-1 text-xs">
                  Save Preset
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Central Map Area */}
        <div className="flex-1 relative">
          <EmergencyMap alerts={alerts} />
        </div>

        {/* Right Sidebar */}
        <div className="w-[350px] border-l border-border flex flex-col">
          {/* System Performance */}
          <div className="h-[300px] p-4">
            <SystemMetrics />
          </div>
          
          {/* Today's Overview */}
          <div className="h-[300px] p-4 border-t border-border">
            <Card className="command-panel p-4 h-full">
              <h3 className="font-semibold text-lg mb-4">TODAY'S INCIDENT SUMMARY</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()} - Day Shift
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{summary.totalIncidents}</div>
                    <div className="text-xs text-muted-foreground">Total Incidents</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Resolved: {summary.resolved}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Active: {summary.active}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold">{summary.avgResponse} min</div>
                  <div className="text-xs text-muted-foreground">Average Response Time</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Timeline Visualization */}
          <div className="flex-1 p-4 border-t border-border">
            <Timeline />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-card border-t border-border px-6 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="status-indicator status-operational"></div>
            <span>All Systems Operational</span>
          </div>
          <span>Memory: 45%</span>
          <span>CPU: 23%</span>
          <span>Network: 995ms</span>
          <span>v2.1.0</span>
        </div>
        <div className="flex items-center space-x-6">
          <span>Last Backup: 2 hrs ago</span>
          <span>Uptime: 15d 4h 23m</span>
          <span>Users Online: 12</span>
        </div>
      </footer>
    </div>
  );
}
