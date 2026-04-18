import React, { useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const center = { lat: 20.5937, lng: 78.9629 }; // Center of India

interface Props {
  onSelect: (address: string, lat: number, lng: number) => void;
  label: string;
}

const LocationPicker: React.FC<Props> = ({ onSelect, label }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  const [marker, setMarker] = useState<google.maps.LatLngLiteral | null>(null);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      
      // Simple reverse geocoding
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`);
        const data = await response.json();
        const address = data.results[0]?.formatted_address || "Custom Location";
        onSelect(address, lat, lng);
      } catch (error) {
        onSelect(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng);
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const lat = latitude;
        const lng = longitude;
        setMarker({ lat, lng });
        onSelect(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng);
      });
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs text-blue-600 font-bold hover:underline"
        >
          Use Current Location
        </button>
      </div>
      <div className="h-64 rounded-2xl overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={marker || center}
          zoom={5}
          onClick={handleMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>
      {marker && (
        <p className="text-xs text-gray-500 italic">Location selected: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</p>
      )}
    </div>
  );
};

export default LocationPicker;
