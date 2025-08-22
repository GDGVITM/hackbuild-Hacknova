"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "@/components/Navigation";
import { Loader2, AlertCircle } from "lucide-react";

// --- Type Definitions ---
// This matches the structure of each alert from your /api/map endpoint
interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  location: string;
  time: string;
  reports: number;
  credibility: number;
  description: string;
  coordinates: [number, number];
}

// This matches the top-level structure of the /api/map response
interface MapData {
  alerts: Alert[];
}

// --- Custom Icon Definitions ---
const iconUrls = {
  critical: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  high: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  medium: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  low: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
};

const createIcon = (url: string) => {
  return new L.Icon({
    iconUrl: url,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  critical: createIcon(iconUrls.critical),
  high: createIcon(iconUrls.high),
  medium: createIcon(iconUrls.medium),
  low: createIcon(iconUrls.low),
};

const MapPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Effect for fetching data from the API
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/map");
        if (!res.ok) throw new Error("Failed to fetch map data");
        const data: MapData = await res.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError("Failed to connect to the server.");
        console.error("Error fetching map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Effect for initializing and cleaning up the map
  useEffect(() => {
    if (mapInstance === null) {
      const map = L.map("map").setView([20.5937, 78.9629], 4); // Centered on India
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      setMapInstance(map);
    }
    // Cleanup function to remove the map instance when the component unmounts
    return () => {
      mapInstance?.remove();
    };
  }, [mapInstance]);

  // Effect for adding markers to the map when alerts data changes
  useEffect(() => {
    if (mapInstance && alerts.length > 0) {
      // Clear existing markers before adding new ones
      mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.removeLayer(layer);
        }
      });

      alerts.forEach((alert) => {
        if (alert.coordinates && alert.coordinates[0] !== 0) {
          L.marker(alert.coordinates, { icon: icons[alert.severity] || icons.low })
            .addTo(mapInstance)
            .bindPopup(
              `<div style="font-family: sans-serif;">
                 <h3 style="margin: 0 0 5px 0; font-size: 1.1em;"><b>${alert.title}</b></h3>
                 <p style="margin: 0;"><b>Location:</b> ${alert.location}</p>
                 <p style="margin: 2px 0;"><b>Credibility:</b> ${alert.credibility.toFixed(1)}/10 (${alert.reports} reports)</p>
                 <p style="margin: 0; color: #555;"><i>${alert.description}</i></p>
               </div>`
            );
        }
      });
    }
  }, [alerts, mapInstance]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">🗺️ Live Emergency Map</h1>
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4">Loading Map Data...</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 z-10 text-destructive">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="font-semibold">{error}</p>
              </div>
            )}
            <div
              id="map"
              className="rounded-xl shadow-lg border"
              style={{ height: "calc(100vh - 200px)", width: "100%" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;