import { AlertPanel } from '@/components/AlertPanel';
import { Navigation } from '@/components/Navigation';

const mockAlerts = [
  {
    id: '1',
    severity: 'critical' as const,
    title: 'Building Collapse',
    location: 'Downtown Mumbai, Maharashtra',
    time: '2 mins ago',
    reports: 15,
    credibility: 9.2,
    description: 'Multi-story building collapsed on Main Street',
    coordinates: [19.0760, 72.8777] as [number, number]
  },
  {
    id: '2',
    severity: 'high' as const,
    title: 'Flash Flood Warning',  
    location: 'Austin, Texas, USA',
    time: '7 mins ago',
    reports: 8,
    credibility: 8.7,
    description: 'Water level rising rapidly near I-35 underpass',
    coordinates: [30.2672, -97.7431] as [number, number]
  },
  {
    id: '3',
    severity: 'medium' as const,
    title: 'Power Outage',
    location: 'Brooklyn, New York, USA', 
    time: '12 mins ago',
    reports: 23,
    credibility: 7.8,
    description: 'Large scale power outage affecting multiple neighborhoods',
    coordinates: [40.6782, -73.9442] as [number, number]
  },
  {
    id: '4',
    severity: 'high' as const,
    title: 'Wildfire Spreading',
    location: 'Los Angeles, California, USA',
    time: '15 mins ago', 
    reports: 31,
    credibility: 9.1,
    description: 'Fast-moving wildfire threatening residential areas',
    coordinates: [34.0522, -118.2437] as [number, number]
  },
  {
    id: '5',
    severity: 'low' as const,
    title: 'Traffic Accident',
    location: 'London, UK',
    time: '18 mins ago',
    reports: 5,
    credibility: 6.9,
    description: 'Multi-vehicle accident on M25 causing delays',
    coordinates: [51.5074, -0.1278] as [number, number]
  }
];

const Alerts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">🚨 Alert Management</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Panel */}
            <div className="lg:col-span-2">
              <AlertPanel alerts={mockAlerts} />
            </div>
            
            {/* Filters */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">🔍 Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <input 
                      type="text" 
                      placeholder="Location/Keywords"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Range</label>
                    <select className="w-full px-3 py-2 border rounded-md bg-background">
                      <option>Last Hour</option>
                      <option>Last 6 Hours</option>
                      <option>Last 24 Hours</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Critical
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        High
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Medium
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Low
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Credibility Threshold</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue="7"
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">7.0+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;