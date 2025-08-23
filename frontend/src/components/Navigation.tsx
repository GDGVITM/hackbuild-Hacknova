import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navigationItems = [
  { path: '/', label: '🏠 Dashboard' },
  { path: '/alerts', label: '🚨 Alerts' },
  { path: '/map', label: '🗺️ Map' },
  { path: '/analytics', label: '📊 Analytics' }
];

export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border shadow-md">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-lg md:text-xl font-bold text-primary">
          DISASTER ALERT SYSTEM
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1">
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

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2 animate-slideDown">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
