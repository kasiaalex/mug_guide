"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const europeanCapitals = [
  "Vienna","Warsaw","Paris","Berlin","Zurich","London","Madrid","Rome",
  "Amsterdam","Brussels","Lisbon","Copenhagen","Oslo","Stockholm",
  "Helsinki","Dublin","Prague","Budapest","Athens","Reykjavik","Luxembourg"
];

export default function Home() {
  const router = useRouter();
  const [city, setCity] = useState("Vienna");
  const [distance, setDistance] = useState("3 km");

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <img src="/logo1.png" alt="Mug guide Logo" className="w-64 mb-8" />
      <h1 className="text-4xl font-bold mb-4 text-center">Run. Explore. Coffee.</h1>
      <h1 className="text-4xl font-bold mb-4 text-center">with MUG GUIDE</h1>
      <p className="text-gray-400 mb-10 text-center max-w-md">
        Generate beautiful running routes that end at the perfect café.
      </p>

      <div className="bg-neutral-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <label className="block mb-2 font-medium">Choose City</label>
        <select
          className="w-full p-3 bg-black border border-gray-700 rounded-xl mb-6"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {europeanCapitals.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Select Distance</label>
        <select
          className="w-full p-3 bg-black border border-gray-700 rounded-xl mb-6"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        >
          <option>3 km</option>
          <option>5 km</option>
          <option>10 km</option>
          <option>15 km</option>
          <option>20 km</option>
        </select>

        <button
          className="w-full bg-white text-black p-3 rounded-xl font-semibold hover:opacity-80 transition mb-6"
          onClick={() => router.push(`/map/${city.toLowerCase()}`)}
        >
          Discover our Map
        </button>
      </div>
    </main>
  );
}