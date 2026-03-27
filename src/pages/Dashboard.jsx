import { useEffect, useState } from "react";
import API from "../services/api";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Dashboard = () => {
  const [needs, setNeeds] = useState([]);

  const loadNeeds = async () => {
    try {
      const res = await API.get("/needs");
      setNeeds(res.data || []);
    } catch (err) {
      console.error("Failed to load needs", err);
    }
  };

  useEffect(() => {
    loadNeeds();
    const interval = setInterval(loadNeeds, 5000);
    return () => clearInterval(interval);
  }, []);

  const center = [26.8467, 80.9462];

  return (
    <div className="w-full h-[calc(100vh-6rem)]">
      <div className="w-full h-full rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden relative z-0">
        <MapContainer center={center} zoom={6} className="h-full w-full z-0">
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {needs.map((need) => {
            const lat = 24 + Math.random() * 6;
            const lng = 78 + Math.random() * 6;

            return (
              <Marker key={need.id} position={[lat, lng]}>
                <Popup>
                  <strong>{need.type}</strong>
                  <br />
                  {need.quantity}
                  <br />
                  {need.pickup_address}
                  <br />
                  Status: {need.status}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default Dashboard;
