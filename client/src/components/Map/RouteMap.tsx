import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RotateCcw, Layers, AlertTriangle } from 'lucide-react';
import { RouteOption, TransitLocation } from '../../types/index.js';

// Custom Map Pins
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
        transform: translate(-14px, -14px);
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const sourceIcon = createCustomIcon('#10B981', 'S'); // Green
const destIcon = createCustomIcon('#EF4444', 'D'); // Red
const stopIcon = createCustomIcon('#3B82F6', '•'); // Blue
const userIcon = createCustomIcon('#8B5CF6', '★'); // Purple

// Mode color map
const MODE_COLORS: Record<string, string> = {
  BUS: '#2563EB',      // Blue
  TRAIN: '#9333EA',    // Purple
  METRO: '#059669',    // Emerald
  AUTO: '#D97706',     // Amber
  MULTIMODAL: '#3B82F6', // Light Blue
};

interface MapUpdaterProps {
  bounds: [number, number][];
  recenterTrigger: number;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ bounds, recenterTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        const leafletBounds = L.latLngBounds(bounds.map(([lat, lng]) => [lat, lng]));
        map.fitBounds(leafletBounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // Fallback
      }
    }
  }, [bounds, recenterTrigger, map]);

  return null;
};

interface RouteMapProps {
  sourceLocation?: TransitLocation | null;
  destLocation?: TransitLocation | null;
  selectedRoute?: RouteOption | null;
  allLocations?: TransitLocation[];
  userLocation?: [number, number] | null;
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  sourceLocation,
  destLocation,
  selectedRoute,
  allLocations = [],
  userLocation,
  className = 'h-[500px] w-full',
}) => {
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [tileError, setTileError] = useState(false);

  // Compute map bounds
  const mapBounds: [number, number][] = useMemo(() => {
    const coords: [number, number][] = [];
    if (selectedRoute && selectedRoute.pathCoordinates && selectedRoute.pathCoordinates.length > 0) {
      return selectedRoute.pathCoordinates;
    }
    if (sourceLocation) coords.push([sourceLocation.latitude, sourceLocation.longitude]);
    if (destLocation) coords.push([destLocation.latitude, destLocation.longitude]);
    if (coords.length > 0) return coords;
    // Default Chennai bounds
    return [
      [13.0827, 80.2755], // Central
      [12.9249, 80.1000], // Tambaram
      [13.1143, 80.1548], // Ambattur
      [12.8996, 80.2279], // Sholinganallur
    ];
  }, [selectedRoute, sourceLocation, destLocation]);

  const polylineColor = selectedRoute
    ? MODE_COLORS[selectedRoute.mode] || '#2563EB'
    : '#2563EB';

  const defaultCenter: [number, number] = [13.04, 80.22]; // Center of Chennai

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-700 shadow-md ${className}`}>
      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />

        <MapUpdater bounds={mapBounds} recenterTrigger={recenterTrigger} />

        {/* Selected Route Polyline */}
        {selectedRoute && selectedRoute.pathCoordinates && (
          <Polyline
            positions={selectedRoute.pathCoordinates}
            pathOptions={{
              color: polylineColor,
              weight: 5,
              opacity: 0.85,
              dashArray: selectedRoute.mode === 'AUTO' ? '8, 8' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Source Location Marker */}
        {sourceLocation && (
          <Marker position={[sourceLocation.latitude, sourceLocation.longitude]} icon={sourceIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-emerald-600">Starting Point</p>
                <p className="font-semibold text-slate-800">{sourceLocation.name}</p>
                <p className="text-slate-500">{sourceLocation.areaType}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Location Marker */}
        {destLocation && (
          <Marker position={[destLocation.latitude, destLocation.longitude]} icon={destIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-rose-600">Destination Point</p>
                <p className="font-semibold text-slate-800">{destLocation.name}</p>
                <p className="text-slate-500">{destLocation.areaType}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User Current Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-purple-600">Your Current Position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Transit Stops */}
        {allLocations
          .filter(
            (loc) =>
              loc.name !== sourceLocation?.name &&
              loc.name !== destLocation?.name &&
              selectedRoute?.steps.some((s) => s.fromStop === loc.name || s.toStop === loc.name)
          )
          .map((loc) => {
            const pos: [number, number] = [loc.latitude, loc.longitude];
            return (
              <Marker key={loc.id} position={pos} icon={stopIcon}>
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-bold text-blue-600">Transit Stop</p>
                    <p className="font-semibold text-slate-800">{loc.name}</p>
                    <p className="text-slate-500">{loc.areaType}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Recenter & Fit Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setRecenterTrigger((prev) => prev + 1)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/90 dark:bg-navy-800/90 hover:bg-white dark:hover:bg-navy-700 backdrop-blur-md border border-slate-200 dark:border-navy-600 rounded-xl shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          title="Recenter Map Bounds"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Fit Route</span>
        </button>
      </div>

      {/* Mode Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-navy-800/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 shadow-lg text-[11px]">
        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Transport Modes</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" /> Bus (MTC)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA]" /> Train (EMU)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Metro (CMRL)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Auto-rickshaw
          </span>
        </div>
      </div>

      {/* Offline tile notification fallback */}
      {tileError && (
        <div className="absolute top-4 left-4 z-20 bg-amber-500/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-sm">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Map tiles fallback active (offline mode)</span>
        </div>
      )}
    </div>
  );
};
