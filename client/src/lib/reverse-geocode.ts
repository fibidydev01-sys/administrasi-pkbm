interface NominatimResponse {
  display_name: string;
  address: {
    road?: string;
    village?: string;
    suburb?: string;
    city?: string;
    town?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "id",
        "User-Agent": "Yayasan-Absensi-App/1.0",
      },
    });

    if (!response.ok) throw new Error("Geocoding request failed");

    const data: NominatimResponse = await response.json();
    return formatAddress(data);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

function formatAddress(data: NominatimResponse): string {
  const { address } = data;
  const parts: string[] = [];

  if (address.road) parts.push(address.road);
  if (address.village || address.suburb) {
    parts.push(address.village || address.suburb || "");
  }
  if (address.town || address.county) {
    parts.push(address.town || address.county || "");
  }
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);

  if (parts.length === 0) return data.display_name;
  return parts.filter(Boolean).join(", ");
}

export async function getShortAddress(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "id",
        "User-Agent": "Yayasan-Absensi-App/1.0",
      },
    });

    if (!response.ok) throw new Error("Geocoding request failed");

    const data: NominatimResponse = await response.json();
    const { address } = data;

    const parts: string[] = [];
    if (address.road) parts.push(address.road);
    if (address.village || address.suburb) {
      parts.push(address.village || address.suburb || "");
    }
    if (address.city) parts.push(address.city);

    return parts.filter(Boolean).join(", ") || data.display_name;
  } catch (error) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}