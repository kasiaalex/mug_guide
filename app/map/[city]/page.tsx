"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import L from "leaflet";

import { normalizeRowKeys, parseCoord } from "@/utils/normalisations";

// 🔹 Własna ikona pinezki dla kawiarni
const cafeIcon = new L.Icon({
  iconUrl: "/icons/coffee-pin.png",
  iconRetinaUrl: "/icons/coffee-pin.png",
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});

// City centers (fallback when no cafes or for map center)
const cityCenters: Record<string, { lat: number; lng: number }> = {
  vienna: { lat: 48.2082, lng: 16.3738 },
  dublin: { lat: 53.3331, lng: -6.2489 },
  paris: { lat: 48.8566, lng: 2.3522 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  warsaw: { lat: 52.2297, lng: 21.0122 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  london: { lat: 51.5074, lng: -0.1278 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  rome: { lat: 41.9028, lng: 12.4964 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  brussels: { lat: 50.8503, lng: 4.3517 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  copenhagen: { lat: 55.6761, lng: 12.5683 },
  oslo: { lat: 59.9139, lng: 10.7522 },
  stockholm: { lat: 59.3293, lng: 18.0686 },
  helsinki: { lat: 60.1695, lng: 24.9354 },
  prague: { lat: 50.0755, lng: 14.4378 },
  budapest: { lat: 47.4979, lng: 19.0402 },
  athens: { lat: 37.9838, lng: 23.7275 },
  reykjavik: { lat: 64.1466, lng: -21.9426 },
  luxembourg: { lat: 49.6117, lng: 6.1319 },
};

interface Cafe {
  name: string;
  lat: number;
  lng: number;
  city: string;
  grade?: string;
  opinion?: string;
  instagram?: string;
  routes?: string;
}

interface CityData {
  lat: number;
  lng: number;
  cafes: Cafe[];
}




/** Build Cafe with lat/lng from various column names (lat, latitude, lng, longitude) */
function rowToCafe(row: Record<string, unknown>): Cafe {
  const lat = parseCoord(row.lat ?? row.latitude);
  const lng = parseCoord(row.lng ?? row.longitude);
  return {
    name: String(row.name ?? row.cafe ?? ""),
    lat,
    lng,
    city: String(row.city ?? "").toLowerCase().trim(),
    grade: row.grade != null ? String(row.grade) : undefined,
    opinion: row.opinion != null ? String(row.opinion) : undefined,
    instagram: row.instagram != null ? String(row.instagram) : undefined,
    routes: row.routes != null ? String(row.routes) : undefined,
  };
}

export default function MapPage() {
  const router = useRouter();
  const params = useParams();
  const cityParam = typeof params.city === "string" ? params.city.toLowerCase() : "";
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCafes() {
      if (!cityParam) {
        setLoading(false);
        return;
      }
      try {
        // File in public/data is served at /data/ by Next.js
        const response = await fetch(`/data/MG_cafes.xlsx`);
        if (!response.ok) throw new Error(`Failed to fetch Excel: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        // Normalize keys to lowercase, then build Cafe with robust lat/lng parsing
        let data = rawRows
          .map((row) => normalizeRowKeys(row))
          .map((row) => rowToCafe(row as Record<string, unknown>));
        const filteredCafes = data
          .filter((cafe) => cafe.city === cityParam)
          .filter((cafe) => Number.isFinite(cafe.lat) && Number.isFinite(cafe.lng));
        const defaultCoords = cityCenters[cityParam] || { lat: 0, lng: 0 };
        const mapLat = filteredCafes[0]?.lat ?? defaultCoords.lat;
        const mapLng = filteredCafes[0]?.lng ?? defaultCoords.lng;
        setCityData({ lat: mapLat, lng: mapLng, cafes: filteredCafes });
      } catch (error) {
        console.error("Failed to load cafes:", error);
        setCityData(null);
      } finally {
        setLoading(false);
      }
    }
    loadCafes();
  }, [cityParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  if (!cityParam) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <h1>No city specified</h1>
      </div>
    );
  }

  const cityName = cityParam.charAt(0).toUpperCase() + cityParam.slice(1);

  if (!cityData || cityData.cafes.length === 0) {
    return (
      <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center">
        <img
          src="/logo1.png"
          alt="Mug guide Logo"
          className="absolute top-4 left-4 w-32 z-50 cursor-pointer rounded-lg mask-[radial-gradient(circle,rgba(0,0,0,1)_80%,rgba(0,0,0,0)_100%)] bg-white"
          onClick={() => router.push("/")}
          title="Back to Home"
        />
        <div className="flex items-center justify-center flex-1">
          <h1>No cafes found for &quot;{cityParam}&quot;</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center">
      <img
        src="/logo1.png"
        alt="Mug guide Logo"
        className="absolute top-4 left-4 w-32 z-50 cursor-pointer rounded-lg mask-[radial-gradient(circle,rgba(0,0,0,1)_80%,rgba(0,0,0,0)_100%)] bg-white"
        onClick={() => router.push("/")}
        title="Back to Home"
      />

      <div className="flex flex-col items-center justify-start mt-24 space-y-4 p-6 w-full">
        <h2 className="text-4xl font-bold text-center">
          Discover our recommendations in {cityName}
        </h2>

        <MapContainer
          key={cityParam}
          center={[cityData.lat, cityData.lng]}
          zoom={15}
          style={{ height: "60vh", width: "60%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {cityData.cafes.map((cafe, index) => (
            <Marker key={index} position={[cafe.lat, cafe.lng]} icon={cafeIcon}>
              <Popup>
                <div className="flex flex-col space-y-1 max-w-xs">
                  <h3 className="font-bold text-lg">{cafe.name}</h3>
                  {cafe.grade && (
                    <p>
                      <strong>Grade:</strong> {cafe.grade}
                    </p>
                  )}
                  {cafe.opinion && (
                    <p>
                      <strong>Opinion:</strong> {cafe.opinion}
                    </p>
                  )}
                  {cafe.routes && (
                    <p>
                      <strong>Routes:</strong> {cafe.routes}
                    </p>
                  )}
                  {cafe.instagram && (
                    <p>
                      <strong>Instagram:</strong>{" "}
                      <a
                        href={cafe.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Visit
                      </a>
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
