import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ZoneData, HealthcareCenter, CitizenSOS, ResourceAllocation } from "../types";

interface TacticalMapProps {
  zones: ZoneData[];
  healthcareCenters: HealthcareCenter[];
  sosReports: CitizenSOS[];
  allocations: ResourceAllocation[];
  selectedZone: ZoneData | null;
  onSelectZone: (zone: ZoneData) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  zones,
  healthcareCenters,
  sosReports,
  allocations,
  selectedZone,
  onSelectZone,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center around Metro Basin (13.0827, 80.2650)
    const map = L.map(mapContainerRef.current, {
      center: [13.0800, 80.2600],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Standard OpenStreetMap with CSS tactical dark invert filter
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when zones, healthcare, SOS, or allocations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Blocked Route & Detour Polyline
    const causewayBlockedRoute = [
      [13.0835, 80.2785],
      [13.0800, 80.2680],
      [13.0760, 80.2600]
    ] as L.LatLngExpression[];

    const northFlyoverDetour = [
      [13.0980, 80.2350],
      [13.0900, 80.2550],
      [13.0835, 80.2785]
    ] as L.LatLngExpression[];

    // Render Causeway line
    const blockedPolyline = L.polyline(causewayBlockedRoute, {
      color: "#ef4444",
      weight: 4,
      dashArray: "6, 8",
      opacity: 0.85
    }).addTo(layerGroup);
    blockedPolyline.bindPopup("<b>CAUSEWAY ARTERIAL 1: SEVERED</b><br/>Structural bridge collapse. Prohibited to all units.");

    // Render Detour line
    const detourPolyline = L.polyline(northFlyoverDetour, {
      color: "#06b6d4",
      weight: 4,
      opacity: 0.8
    }).addTo(layerGroup);
    detourPolyline.bindPopup("<b>DETOUR CORRIDOR: North Flyover B</b><br/>High-clearance route for ambulances & boat slipway access.");

    // 2. Render Disaster Zones
    zones.forEach((zone) => {
      const isSelected = selectedZone?.id === zone.id;
      const color =
        zone.severity === "CRITICAL"
          ? "#ef4444"
          : zone.severity === "HIGH"
          ? "#f59e0b"
          : zone.severity === "MEDIUM"
          ? "#3b82f6"
          : "#10b981";

      // Radius proportional to flood or population
      const circle = L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 0.35 : 0.2,
        weight: isSelected ? 3 : 2,
        radius: 800 + zone.flood_level_meters * 150,
      }).addTo(layerGroup);

      circle.on("click", () => onSelectZone(zone));

      // Zone Marker Tag
      const zoneIcon = L.divIcon({
        className: "custom-zone-icon",
        html: `
          <div style="background-color: ${color}; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; font-family: monospace; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.4);">
            <span>${zone.name.split("—")[0].trim()}</span>
            <span style="background: rgba(0,0,0,0.4); padding: 1px 4px; border-radius: 3px;">${zone.flood_level_meters}m</span>
          </div>
        `,
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: zoneIcon }).addTo(layerGroup);
      marker.on("click", () => onSelectZone(zone));

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <h4 style="margin: 0 0 4px 0; color: #38bdf8; font-size: 13px;">${zone.name}</h4>
          <p style="margin: 2px 0;"><strong>Severity:</strong> <span style="color: ${color};">${zone.severity}</span></p>
          <p style="margin: 2px 0;"><strong>Flood Height:</strong> ${zone.flood_level_meters} meters</p>
          <p style="margin: 2px 0;"><strong>Casualties:</strong> ${zone.casualties} reported</p>
          <p style="margin: 2px 0;"><strong>Trapped Citizens:</strong> ${zone.trapped_count}</p>
          <p style="margin: 2px 0;"><strong>Evacuation:</strong> ${zone.evacuation_percentage}% complete</p>
          <p style="margin: 2px 0;"><strong>Open Route:</strong> ${zone.accessible_routes.join(", ") || "None"}</p>
        </div>
      `);
    });

    // 3. Render Healthcare Facilities
    healthcareCenters.forEach((hosp) => {
      const isSurge = hosp.emergency_capacity_status === "SURGE" || hosp.emergency_capacity_status === "OVERFLOW";
      const icon = L.divIcon({
        className: "hosp-icon",
        html: `
          <div style="background-color: ${isSurge ? "#dc2626" : "#2563eb"}; border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.6);">
            +
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <h4 style="margin: 0 0 4px 0; color: #60a5fa;">${hosp.name}</h4>
          <p style="margin: 2px 0;"><strong>Type:</strong> ${hosp.type}</p>
          <p style="margin: 2px 0;"><strong>Available Beds:</strong> ${hosp.available_beds} / ${hosp.total_beds}</p>
          <p style="margin: 2px 0;"><strong>ICU Available:</strong> ${hosp.icu_beds_available}</p>
          <p style="margin: 2px 0;"><strong>Status:</strong> <span style="color: ${isSurge ? '#ef4444' : '#10b981'}">${hosp.emergency_capacity_status}</span></p>
          <p style="margin: 2px 0;"><strong>Distance:</strong> ${hosp.distance_km} km (${hosp.eta_minutes} mins)</p>
          <p style="margin: 2px 0;"><strong>Accepting Critical:</strong> ${hosp.accepting_critical ? "YES" : "DIVERTED"}</p>
        </div>
      `);
    });

    // 4. Render Citizen SOS Beacons
    sosReports.forEach((sos) => {
      if (sos.duplicate_of) return; // avoid cluttering duplicate markers

      const isCritical = sos.severity === "CRITICAL";
      const beaconIcon = L.divIcon({
        className: "sos-icon",
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: ${isCritical ? "#ef4444" : "#f59e0b"}; opacity: 0.8; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; margin: 4px; border-radius: 50%; background-color: #ffffff; border: 3px solid ${isCritical ? "#ef4444" : "#f59e0b"};"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([sos.lat, sos.lng], { icon: beaconIcon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <h4 style="margin: 0 0 4px 0; color: #f87171;">SOS: ${sos.name} (${sos.emergency_type})</h4>
          <p style="margin: 2px 0;"><strong>Trapped People:</strong> ${sos.people_count}</p>
          <p style="margin: 2px 0;"><strong>Medical Need:</strong> ${sos.medical_emergency ? "CRITICAL" : "None"}</p>
          <p style="margin: 2px 0;"><strong>Address:</strong> ${sos.address}</p>
          <p style="margin: 2px 0;"><em>"${sos.description}"</em></p>
          <p style="margin: 2px 0; font-size: 10px; color: #94a3b8;">Status: ${sos.status}</p>
        </div>
      `);
    });

  }, [zones, healthcareCenters, sosReports, allocations, selectedZone]);

  return (
    <div className="relative w-full h-[480px] lg:h-[540px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Tactical Overlay Controls */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 px-3 py-2 rounded-md shadow-lg flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono font-semibold text-slate-200">Critical Flood Basin</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-300">Healthcare Facilities</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 border-dashed" />
          <span className="text-red-400 font-mono text-[11px]">Severed Causeway</span>
        </div>
      </div>

      {/* Selected Zone Quick Card */}
      {selectedZone && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md border border-cyan-800/80 p-3 rounded-lg shadow-xl text-xs max-w-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-2">
            <span className="font-bold text-slate-100">{selectedZone.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/50">
              {selectedZone.severity}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
            <div>Water Height: <strong className="text-cyan-400">{selectedZone.flood_level_meters}m</strong></div>
            <div>Casualties: <strong className="text-red-400">{selectedZone.casualties}</strong></div>
            <div>Trapped: <strong className="text-amber-400">{selectedZone.trapped_count}</strong></div>
            <div>Evacuated: <strong className="text-emerald-400">{selectedZone.evacuation_percentage}%</strong></div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            Open Routes: {selectedZone.accessible_routes.join(", ") || "Severed"}
          </div>
        </div>
      )}
    </div>
  );
};
