// Fix untuk Leaflet icon di Next.js
import L from "leaflet";

export function fixLeafletIcons() {
  // Only run on client side
  if (typeof window === "undefined") return;

  // Fix default marker icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Custom marker icons
export function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export const markerIcons = {
  school: createColoredIcon("#3b82f6"),  // Blue
  masuk: createColoredIcon("#22c55e"),   // Green
  pulang: createColoredIcon("#a855f7"),  // Purple
};