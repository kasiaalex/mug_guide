"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useParams, useRouter } from "next/navigation";
import L from "leaflet";

// 🔹 Własna ikona pinezki dla kawiarni
const cafeIcon = new L.Icon({
  iconUrl: "/icons/coffee-pin.png",
  iconRetinaUrl: "/icons/coffee-pin.png",
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
});

// 🔹 Typ danych miasta
interface CityData {
  lat: number;
  lng: number;
  cafes: { name: string; lat: number; lng: number }[];
}

// 🔹 Dane miast
const cities: Record<string, CityData> = {
  vienna: { lat: 48.2082, lng: 16.3738, cafes: [{ name: "Coffee Pirates", lat: 48.2100, lng: 16.3725 }] },
  dublin: { lat: 53.3331, lng: -6.2489, cafes: [{ name: "3FE", lat: 53.3335, lng: -6.2495 }] },
  paris: { lat: 48.8566, lng: 2.3522, cafes: [{ name: "Café de Flore", lat: 48.8550, lng: 2.3330 }] },
  berlin: { lat: 52.5200, lng: 13.4050, cafes: [{ name: "The Barn", lat: 52.5220, lng: 13.4055 }] },
  warsaw: { lat: 52.2297, lng: 21.0122, cafes: [{ name: "Relax Café", lat: 52.2300, lng: 21.0100 }] },
  zurich: { lat: 47.3769, lng: 8.5417, cafes: [{ name: "Café Schober", lat: 47.3775, lng: 8.5420 }] },
  london: { lat: 51.5074, lng: -0.1278, cafes: [{ name: "Monmouth Coffee", lat: 51.5080, lng: -0.1270 }] },
  madrid: { lat: 40.4168, lng: -3.7038, cafes: [{ name: "Toma Café", lat: 40.4175, lng: -3.7030 }] },
  rome: { lat: 41.9028, lng: 12.4964, cafes: [{ name: "Sant'Eustachio Il Caffè", lat: 41.9035, lng: 12.4970 }] },
  amsterdam: { lat: 52.3676, lng: 4.9041, cafes: [{ name: "Bocca Coffee", lat: 52.3680, lng: 4.9035 }] },
  brussels: { lat: 50.8503, lng: 4.3517, cafes: [{ name: "Café Capitale", lat: 50.8510, lng: 4.3510 }] },
  lisbon: { lat: 38.7223, lng: -9.1393, cafes: [{ name: "Fabrica Coffee Roasters", lat: 38.7230, lng: -9.1385 }] },
  copenhagen: { lat: 55.6761, lng: 12.5683, cafes: [{ name: "The Coffee Collective", lat: 55.6765, lng: 12.5680 }] },
  oslo: { lat: 59.9139, lng: 10.7522, cafes: [{ name: "Tim Wendelboe", lat: 59.9145, lng: 10.7515 }] },
  stockholm: { lat: 59.3293, lng: 18.0686, cafes: [{ name: "Drop Coffee", lat: 59.3300, lng: 18.0680 }] },
  helsinki: { lat: 60.1695, lng: 24.9354, cafes: [{ name: "Good Life Coffee", lat: 60.1700, lng: 24.9350 }] },
  prague: { lat: 50.0755, lng: 14.4378, cafes: [{ name: "Můj šálek kávy", lat: 50.0760, lng: 14.4370 }] },
  budapest: { lat: 47.4979, lng: 19.0402, cafes: [{ name: "Espresso Embassy", lat: 47.4985, lng: 19.0395 }] },
  athens: { lat: 37.9838, lng: 23.7275, cafes: [{ name: "Tailor Made", lat: 37.9845, lng: 23.7260 }] },
  reykjavik: { lat: 64.1466, lng: -21.9426, cafes: [{ name: "Reykjavik Roasters", lat: 64.1470, lng: -21.9420 }] },
  luxembourg: { lat: 49.6117, lng: 6.1319, cafes: [{ name: "Konrad Café & Bar", lat: 49.6120, lng: 6.1310 }] },
};

export default function MapPage() {
  const router = useRouter();
  const params = useParams();
  const cityParam = typeof params.city === "string" ? params.city.toLowerCase() : "vienna";
  const cityData = cities[cityParam] || cities["vienna"];
  const cityName = cityParam.charAt(0).toUpperCase() + cityParam.slice(1);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex flex-col items-center">
      
      {/* 🔹 Klikalne logo - powrót do Home */}
      <img
        src="/logo1.png"
        alt="Mug guide Logo"
        className="absolute top-4 left-4 w-32 z-50 cursor-pointer rounded-lg mask-[radial-gradient(circle,rgba(0,0,0,1)_80%,rgba(0,0,0,0)_100%)] bg-white"
        onClick={() => router.push("http://localhost:3000/")} // <- tutaj kierujemy na Home
        title="Back to Home"
      />

      <div className="flex flex-col items-center justify-start mt-24 space-y-4 p-6 w-full">
        <h2 className="text-4xl font-bold text-center">
          Discover our recommendations in {cityName}
        </h2>

        <MapContainer
          key={cityParam} // 🔹 remount mapy przy zmianie miasta
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
              <Popup>{cafe.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}