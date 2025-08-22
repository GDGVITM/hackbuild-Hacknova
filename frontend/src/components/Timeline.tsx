import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const timelineData = [
  { time: '6AM', incidents: 8, severity: 'low' },
  { time: '9AM', incidents: 15, severity: 'medium' },
  { time: '12PM', incidents: 23, severity: 'medium' },
  { time: '3PM', incidents: 31, severity: 'high' },
  { time: '6PM', incidents: 45, severity: 'critical' },
  { time: '9PM', incidents: 38, severity: 'high' },
  { time: '12AM', incidents: 19, severity: 'medium' },
  { time: '3AM', incidents: 7, severity: 'low' },
];

export function Timeline() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#CA8A04';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">
            {data.incidents} incidents
          </p>
          <p className="text-xs">
            Severity: <span className="capitalize" style={{ color: getSeverityColor(data.severity) }}>
              {data.severity}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="command-panel p-4 h-full">
      <h3 className="font-semibold text-lg mb-4">INCIDENT TIMELINE (Last 24 Hours)</h3>
      
      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={timelineData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="incidents" radius={[2, 2, 0, 0]}>
              {timelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground">Peak: </span>
            <span className="font-semibold">6PM (45 incidents)</span>
          </div>
          <div>
            <span className="text-muted-foreground">Current: </span>
            <span className="font-semibold">2PM (23 active)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground">Quiet Period: </span>
            <span className="text-green-400">2AM-5AM</span>
          </div>
          <div>
            <span className="text-muted-foreground">Next Expected: </span>
            <span className="text-yellow-400">8PM</span>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="text-xs text-muted-foreground">
            🔍 Click any time period to filter map data
          </div>
          <div className="text-xs text-muted-foreground">
            📊 Hover for detailed incident breakdown
          </div>
        </div>
      </div>
    </Card>
  );
}