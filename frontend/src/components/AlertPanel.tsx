import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Star, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react';

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

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">🔴 CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-orange-600 text-white">🟠 HIGH</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600 text-black">🟡 MEDIUM</Badge>;
      case 'low':
        return <Badge className="bg-green-600 text-white">🟢 LOW</Badge>;
      case 'resolved':
        return <Badge className="bg-gray-600 text-white">⚫ RESOLVED</Badge>;
      default:
        return <Badge variant="secondary">{severity.toUpperCase()}</Badge>;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'alert-critical';
      case 'high':
        return 'alert-high';
      case 'medium':
        return 'alert-medium';
      case 'low':
        return 'alert-low';
      case 'resolved':
        return 'alert-resolved';
      default:
        return '';
    }
  };

  return (
    <Card className="command-panel h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          HIGH PRIORITY ALERTS
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {alerts.map((alert, index) => (
          <div 
            key={alert.id} 
            className={`p-4 border-b border-border last:border-b-0 ${getSeverityClass(alert.severity)} transition-all hover:bg-secondary/20`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                {getSeverityBadge(alert.severity)}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </div>
              </div>

              {/* Title and Location */}
              <div>
                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{alert.location}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{alert.reports} reports</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>{alert.credibility}/10 credibility</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground italic">
                "{alert.description}"
              </p>

              {/* Actions */}
              <div className="flex space-x-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-7 bg-red-600/10 border-red-600/30 hover:bg-red-600/20"
                >
                  DISPATCH
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-7"
                >
                  DETAILS
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full text-sm">
          VIEW ALL 156 ALERTS ▼
        </Button>
      </div>
    </Card>
  );
}