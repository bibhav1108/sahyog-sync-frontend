import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import API from "../services/api";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
};

const PickLocation = () => {
    const { alert_id } = useParams();
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState("idle"); // idle, saving, success, error
    const [error, setError] = useState("");

    const center = [26.8467, 80.9462]; // Lucknow default

    useEffect(() => {
        // Try to get user's current position to start with
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            });
        }
    }, []);

    const handleConfirm = async () => {
        if (!position) return;
        setStatus("saving");
        try {
            await API.patch(`/marketplace/alerts/${alert_id}/location`, {
                latitude: position.lat,
                longitude: position.lng
            });
            setStatus("success");
        } catch (err) {
            setError(err?.response?.data?.detail || "Failed to update location");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl animate-fadeIn">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                        <span className="material-symbols-outlined text-white text-4xl font-bold">check</span>
                    </div>
                    <h1 className="text-3xl font-outfit font-black mb-4">Location Set!</h1>
                    <p className="text-on_surface_variant leading-relaxed mb-8">
                        Our volunteers can now see exactly where to reach you. You can close this window and return to Telegram.
                    </p>
                    <button 
                        onClick={() => window.close()}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen relative overflow-hidden font-inter text-on_surface">
            {/* MAP LAYER */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer 
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}" 
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    />
                    <LocationPicker onLocationSelect={setPosition} />
                    {position && <Marker position={position} animate={true} />}
                </MapContainer>
            </div>

            {/* OVERLAY UI */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none">
                <div className="max-w-lg mx-auto bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 pointer-events-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">location_on</span>
                    </div>
                    <div>
                        <h1 className="font-outfit font-black text-lg">Pick Pickup Spot</h1>
                        <p className="text-xs text-on_surface_variant">Tap on the map to set the exact collection point.</p>
                    </div>
                </div>
            </div>

            {/* ERROR TOAST */}
            {error && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md animate-slide-up">
                    <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        <p className="text-xs font-bold">{error}</p>
                    </div>
                </div>
            )}

            {/* ACTION FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <button
                        onClick={handleConfirm}
                        disabled={!position || status === "saving"}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 
                            ${!position ? "bg-white/20 text-white/40 cursor-not-allowed backdrop-blur-sm" : 
                              status === "saving" ? "bg-white/40 text-white animate-pulse" : 
                              "bg-primary text-white hover:shadow-primary/30"}`}
                    >
                        {status === "saving" ? "Updating System..." : (
                            <>
                                <span className="material-symbols-outlined text-xl">verified</span>
                                Confirm Collection Point
                            </>
                        )}
                    </button>
                    {!position && (
                        <p className="text-center text-[10px] text-white/60 mt-4 uppercase font-bold tracking-tighter">
                            Select a point on the map to continue
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PickLocation;
