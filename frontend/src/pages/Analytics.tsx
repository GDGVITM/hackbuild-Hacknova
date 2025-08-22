import { SystemMetrics } from '@/components/SystemMetrics';
import { Timeline } from '@/components/Timeline';
import { Navigation } from '@/components/Navigation';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">📊 Analytics & Metrics</h1>
          
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
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">📈 Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Incidents:</span>
                  <span className="font-bold">284</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-bold text-emerald-500">261</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-bold text-orange-500">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Response Time:</span>
                  <span className="font-bold">3.2 min</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">🏷️ By Type</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>🔥 Fire:</span>
                  <span>45 (16%)</span>
                </div>
                <div className="flex justify-between">
                  <span>🌊 Flood:</span>
                  <span>38 (13%)</span>
                </div>
                <div className="flex justify-between">
                  <span>⚡ Weather:</span>
                  <span>67 (24%)</span>
                </div>
                <div className="flex justify-between">
                  <span>🚗 Accidents:</span>
                  <span>89 (31%)</span>
                </div>
                <div className="flex justify-between">
                  <span>🏗️ Infrastructure:</span>
                  <span>45 (16%)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">📍 Trending Locations</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Mumbai Region:</span>
                  <span className="text-orange-500">+15</span>
                </div>
                <div className="flex justify-between">
                  <span>Delhi NCR:</span>
                  <span className="text-orange-500">+12</span>
                </div>
                <div className="flex justify-between">
                  <span>Bangalore:</span>
                  <span className="text-orange-500">+8</span>
                </div>
                <div className="flex justify-between">
                  <span>Chennai:</span>
                  <span className="text-orange-500">+6</span>
                </div>
                <div className="flex justify-between">
                  <span>Hyderabad:</span>
                  <span className="text-orange-500">+4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;