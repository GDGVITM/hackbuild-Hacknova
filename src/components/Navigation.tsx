import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/', label: '🏠 Dashboard', icon: '🏠' },
  { path: '/alerts', label: '🚨 Alerts', icon: '🚨' },
  { path: '/map', label: '🗺️ Map', icon: '🗺️' },
  { path: '/analytics', label: '📊 Analytics', icon: '📊' }
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold text-primary">
            DISASTER ALERT SYSTEM
          </Link>
          
          <div className="flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};