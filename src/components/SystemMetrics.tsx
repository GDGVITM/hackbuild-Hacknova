import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertCircle, XCircle, Wifi } from 'lucide-react';

export function SystemMetrics() {
  const metrics = [
    { label: 'Posts Processed Today', value: 127543, max: 150000, percentage: 92 },
    { label: 'Current Rate', value: '2,341 posts/min', percentage: 100 },
    { label: 'Response Time', value: '1.2s avg', percentage: 97 },
    { label: 'Classification Accuracy', value: '89.2%', percentage: 89 }
  ];

  const dataSources = [
    { name: 'Twitter/X API', status: 'operational' },
    { name: 'Reddit API', status: 'operational' },
    { name: 'Instagram Basic', status: 'operational' },
    { name: 'Facebook', status: 'warning', note: 'Limited' },
    { name: 'Telegram Channels', status: 'operational' },
    { name: 'TikTok', status: 'critical', note: 'Down' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, note?: string) => {
    const variant = status === 'operational' ? 'default' : status === 'warning' ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="text-xs">
        {status === 'operational' ? '✅' : status === 'warning' ? '⚠️' : '❌'} 
        {note ? ` ${note}` : ''}
      </Badge>
    );
  };

  return (
    <Card className="command-panel p-4 h-full">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        SYSTEM PERFORMANCE
      </h3>
      
      <div className="space-y-4">
        {/* Processing Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-mono font-semibold">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={metric.percentage} className="flex-1 h-2" />
                <span className="text-xs font-mono text-muted-foreground min-w-[3rem] text-right">
                  {metric.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Data Sources Status */}
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold mb-3 text-sm">DATA SOURCES STATUS</h4>
          <div className="grid grid-cols-2 gap-2">
            {dataSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-secondary/50">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(source.status)}
                  <span className="truncate">{source.name}</span>
                </div>
                {source.note && (
                  <span className="text-muted-foreground">({source.note})</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Network Status */}
        <div className="border-t border-border pt-4">
          <h4 className="font-semibold mb-3 text-sm">NETWORK STATUS</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-900/20 rounded">
              <div className="font-mono font-semibold">99.8%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-2 bg-blue-900/20 rounded">
              <div className="font-mono font-semibold">847ms</div>
              <div className="text-muted-foreground">Latency</div>
            </div>
            <div className="text-center p-2 bg-purple-900/20 rounded">
              <div className="font-mono font-semibold">4.2GB</div>
              <div className="text-muted-foreground">Bandwidth</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}