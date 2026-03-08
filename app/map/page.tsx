"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

// Lista dostępnych miast z przybliżonym centrum (do wyboru na stronie głównej)
const cities: Record<string, { lat: number; lng: number }> = {
  vienna: { lat: 48.2082, lng: 16.3738 },
  dublin: { lat: 53.3331, lng: -6.2489 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  paris: { lat: 48.8566, lng: 2.3522 },
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

// Typ danych dla kawiarni z Excel
interface Cafe {
  name: string;
  lat: number;
  lng: number;
  city: string; // <- new column for filtering
  grade?: string;
  opinion?: string;
  instagram?: string;
  routes?: string;
}

// Typ danych dla miasta
interface CityData {
  lat: number;
  lng: number;
  cafes: Cafe[];
}

// Komponent mapy z popup dla każdej kawiarni
function MapWrapper({ cityData }: { cityData: CityData }) {
  return (
    <MapContainer
      key={`${cityData.lat}-${cityData.lng}`} // wymusza remount przy zmianie miasta
      center={[cityData.lat, cityData.lng]}
      zoom={15}
      style={{ height: "60vh", width: "60%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {cityData.cafes.map((cafe, index) => (
        <Marker key={index} position={[cafe.lat, cafe.lng]}>
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
  );
}

// Strona mapy
export default function MapPage() {
  const params = useParams();
  const cityParam = typeof params.city === "string" ? params.city.toLowerCase() : "";

  const [cityData, setCityData] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCafes() {
      try {
        // cache-busting to always get latest Excel
        const response = await fetch(`/data/MG_cafes.xlsx?timestamp=${Date.now()}`);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        let data = XLSX.utils.sheet_to_json<Cafe>(sheet);

        // parse lat/lng as numbers
        data = data.map((cafe) => ({
          ...cafe,
          lat: Number(cafe.lat),
          lng: Number(cafe.lng),
        }));

        // Filter cafes by city column
        const filteredCafes = data.filter(
          (cafe) => cityParam && cafe.city?.toString().toLowerCase() === cityParam
        );

        // Center map: first cafe or default city coordinates
        const defaultCoords = cities[cityParam] || { lat: 0, lng: 0 };
        const mapLat = filteredCafes[0]?.lat || defaultCoords.lat;
        const mapLng = filteredCafes[0]?.lng || defaultCoords.lng;

        setCityData({ lat: mapLat, lng: mapLng, cafes: filteredCafes });
        setLoading(false);
      } catch (error) {
        console.error("Failed to load cafes:", error);
        setCityData(null);
        setLoading(false);
      }
    }

    loadCafes();
  }, [cityParam]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;
  }

  if (!cityData || cityData.cafes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <h1>No cafes found for "{cityParam}"</h1>
      </div>
    );
  }

  const cityName = cityParam.charAt(0).toUpperCase() + cityParam.slice(1);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center">
      <img
        src="/logo1.png"
        alt="Mug guide Logo"
        className="absolute top-4 left-4 w-32 z-50 rounded-lg mask-[radial-gradient(circle,rgba(0,0,0,1)_80%,rgba(0,0,0,0)_100%)] bg-white"
      />
      <div className="flex flex-col items-center justify-start mt-24 space-y-4 p-6 w-full">
        <h2 className="text-4xl font-bold text-center">
          Discover our recommendations in {cityName}
        </h2>
        <MapWrapper cityData={cityData} />
      </div>
    </div>
  );
}
