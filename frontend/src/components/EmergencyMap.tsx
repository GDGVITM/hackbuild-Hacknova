import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Home, Target, Settings2, X, ExternalLink, AlertTriangle, MapPin, Clock, Users, Star } from 'lucide-react';

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

interface EmergencyMapProps {
  alerts: Alert[];
}

export function EmergencyMap({ alerts }: EmergencyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#CA8A04';
      case 'low': return '#16A34A';
      case 'resolved': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      case 'resolved': return '⚫';
      default: return '⚪';
    }
  };

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    // Initialize Mapbox map
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) {
      // For now, we'll create a placeholder map
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'globe'
    });

    // Add markers for each alert
    alerts.forEach((alert) => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getSeverityColor(alert.severity);
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = `0 0 20px ${getSeverityColor(alert.severity)}66`;
      
      if (alert.severity === 'critical') {
        el.style.animation = 'pulse 2s infinite';
      }

      el.addEventListener('click', () => {
        setSelectedAlert(alert);
      });

      new mapboxgl.Marker(el)
        .setLngLat(alert.coordinates)
        .addTo(map);
    });

    return () => map.remove();
  }, [mapboxToken, alerts]);

  if (showTokenInput) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/20">
        <Card className="command-panel p-6 max-w-md">
          <h3 className="font-semibold text-lg mb-4">Enter Mapbox Token</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to enable the interactive map. 
            Get yours at <a href="https://mapbox.com" target="_blank" className="text-primary underline">mapbox.com</a>
          </p>
          <div className="space-y-4">
            <Input
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowTokenInput(false)}
                className="flex-1"
                disabled={!mapboxToken}
              >
                Initialize Map
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowTokenInput(false)}
              >
                Skip (Demo Mode)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur">
          <Home className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur">
          <Target className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="bg-card/90 backdrop-blur">
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Map Container */}
      {mapboxToken ? (
        <div ref={mapContainer} className="w-full h-full" />
      ) : (
        <div className="w-full h-full bg-secondary/20 relative overflow-hidden">
          {/* Mock World Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Mock Alert Markers */}
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`absolute w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-all hover:scale-125 ${
                alert.severity === 'critical' ? 'pulse-glow' : ''
              }`}
              style={{
                backgroundColor: getSeverityColor(alert.severity),
                left: `${20 + index * 15}%`,
                top: `${30 + index * 10}%`,
                boxShadow: `0 0 20px ${getSeverityColor(alert.severity)}66`
              }}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="w-full h-full flex items-center justify-center text-xs">
                {alert.reports > 10 ? alert.reports : ''}
              </div>
            </div>
          ))}
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">Alert Severity</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Details Popup */}
      {selectedAlert && (
        <div className="absolute inset-4 z-20 flex items-center justify-center pointer-events-none">
          <Card className="command-panel p-6 max-w-lg pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: getSeverityColor(selectedAlert.severity) }}
                >
                  {getSeverityIcon(selectedAlert.severity)}
                </div>
                <div>
                  <Badge 
                    className={`
                      ${selectedAlert.severity === 'critical' ? 'bg-red-600' : ''}
                      ${selectedAlert.severity === 'high' ? 'bg-orange-600' : ''}
                      ${selectedAlert.severity === 'medium' ? 'bg-yellow-600' : ''}
                      ${selectedAlert.severity === 'low' ? 'bg-green-600' : ''}
                    `}
                  >
                    {selectedAlert.severity.toUpperCase()}
                  </Badge>
                  <h3 className="font-semibold text-lg">{selectedAlert.title}</h3>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedAlert.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedAlert.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedAlert.reports} reports</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedAlert.credibility}/10 credibility</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Dispatch Teams
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  Mark Resolved
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}