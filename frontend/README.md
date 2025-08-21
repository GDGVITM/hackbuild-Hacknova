# Disaster Alert System - Emergency Management Dashboard

A professional command center interface designed for emergency dispatch operators and crisis management teams. This system provides real-time disaster monitoring, alert processing, and incident response coordination.

## Project Features

🚨 **Real-time Alert Monitoring**
- Live incident tracking with severity-based color coding
- Automated credibility scoring and verification
- Multi-source data aggregation from social media APIs

🗺️ **Interactive Emergency Map**
- Global incident visualization with clustering
- Interactive markers with detailed incident popups
- Multiple map layers (satellite, terrain, weather overlays)
- Mapbox integration for professional mapping

📊 **System Performance Metrics**
- Real-time processing statistics
- Data source health monitoring
- Network latency and accuracy tracking
- 24/7 operational status indicators

📈 **Analytics Dashboard**
- Historical incident timeline visualization
- Daily summary reports with trend analysis
- Geographic hotspot identification
- Response time optimization metrics

⚙️ **Advanced Filtering**
- Multi-criteria incident filtering
- Customizable credibility thresholds
- Time-based data views
- Disaster type categorization

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom emergency management theme
- **Charts**: Recharts for data visualization
- **Maps**: Mapbox GL JS for interactive mapping
- **UI Components**: shadcn/ui with custom emergency variants
- **State Management**: React hooks with real-time updates

## Design Philosophy

Built for large screens (1920x1080+) and 24/7 operation with:
- High information density for quick decision-making
- Professional dark theme to reduce eye strain
- Color-coded severity system (Critical/High/Medium/Low)
- Minimal cognitive load during high-stress situations
- Multi-monitor support for command centers

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd disaster-alert-system
   npm install
   ```

2. **Set up Mapbox (Optional)**
   - Get your Mapbox public token at [mapbox.com](https://mapbox.com)
   - Enter the token in the map interface when prompted
   - Or skip for demo mode with mock visualizations

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Production Deployment**
   - Build: `npm run build`

## Interface Layout

**Header Bar**: System status, performance metrics, global controls
**Left Sidebar**: Active alerts panel + incident filters & controls  
**Central Area**: Interactive world map with real-time incident markers
**Right Sidebar**: System metrics + daily overview + timeline visualization
**Footer**: System status bar with uptime and resource monitoring

## Alert Severity Levels

🔴 **Critical**: Life-threatening emergencies requiring immediate response
🟠 **High**: Significant incidents with potential for escalation  
🟡 **Medium**: Moderate incidents requiring monitoring
🟢 **Low**: Minor incidents for awareness and documentation
⚫ **Resolved**: Completed incidents for historical reference

## Data Sources

Supports integration with:
- Twitter/X API for social media monitoring
- Reddit API for community reports
- Instagram for visual incident documentation  
- Telegram channels for real-time updates
- Custom webhook integrations
- Government alert feeds

---

Built for emergency management professionals who need reliable, real-time situational awareness.
