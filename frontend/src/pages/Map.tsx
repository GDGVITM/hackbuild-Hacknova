import { EmergencyMap } from '@/components/EmergencyMap';
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
    description: 'Multi-story building collapsed on Main Street. Emergency services are on scene. Multiple casualties reported.',
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
    description: 'Water level rising rapidly near I-35 underpass. Evacuation procedures in effect.',
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
    description: 'Large scale power outage affecting multiple neighborhoods. Utility crews dispatched.',
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
    description: 'Fast-moving wildfire threatening residential areas. Mandatory evacuation orders issued.',
    coordinates: [34.0522, -118.2437] as [number, number]
  }
];

const Map = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">🗺️ Emergency Map</h1>
          
          <div className="h-[calc(100vh-200px)]">
            <EmergencyMap alerts={mockAlerts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;