"use client"; // MUST be first line

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface MapComponentProps {
  city: { lat: number; lng: number };
  cafes: { name: string; lat: number; lng: number }[];
}

export default function MapComponent({ city, cafes }: MapComponentProps) {
  return (
    <MapContainer
      center={[city.lat, city.lng]}
      zoom={15}
      style={{ height: "60vh", width: "60%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {cafes.map((cafe, index) => (
        <Marker key={index} position={[cafe.lat, cafe.lng]}>
          <Popup>{cafe.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}