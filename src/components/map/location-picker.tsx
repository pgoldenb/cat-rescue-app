'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import GoogleMap from './google-map';

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  className?: string;
}

export default function LocationPicker({
  initialLocation,
  onLocationSelect,
  className = "w-full h-64"
}: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const geocodeLocation = useCallback(async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      });

      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        return formattedAddress;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return undefined;
  }, []);

  const updateMarker = useCallback(async (location: { lat: number; lng: number }) => {
    if (!map) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    const newMarker = new google.maps.Marker({
      position: location,
      map,
      draggable: true,
      title: 'Selected Location'
    });

    // Handle marker drag
    newMarker.addListener('dragend', async () => {
      const position = newMarker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        setSelectedLocation({ lat, lng });
        const geocodedAddress = await geocodeLocation(lat, lng);
        onLocationSelect({ lat, lng, address: geocodedAddress });
      }
    });

    markerRef.current = newMarker;

    // Geocode the location
    const geocodedAddress = await geocodeLocation(location.lat, location.lng);
    onLocationSelect({ ...location, address: geocodedAddress });
  }, [map, geocodeLocation, onLocationSelect]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const location = { lat, lng };
      setSelectedLocation(location);
      updateMarker(location);
    }
  }, [updateMarker]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedLocation(location);
        if (map) {
          map.setCenter(location);
          map.setZoom(16);
          updateMarker(location);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please click on the map to select a location.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [map, updateMarker]);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // Add click listener to map
    mapInstance.addListener('click', handleMapClick);

    // If there's an initial location, set the marker
    if (initialLocation) {
      updateMarker(initialLocation);
      mapInstance.setCenter(initialLocation);
      mapInstance.setZoom(16);
    }
  }, [handleMapClick, initialLocation, updateMarker]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isGettingLocation ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
              Getting location...
            </>
          ) : (
            <>
              📍 Use Current Location
            </>
          )}
        </button>
      </div>

      <GoogleMap
        center={selectedLocation || { lat: 40.7128, lng: -74.0060 }}
        zoom={selectedLocation ? 16 : 12}
        className={className}
        onMapLoad={handleMapLoad}
      />

      <div className="text-xs text-gray-500">
        {selectedLocation ? (
          <div className="space-y-1">
            <div>Click and drag the marker to adjust the location</div>
            {address && (
              <div className="font-medium text-gray-700">
                📍 {address}
              </div>
            )}
            <div className="text-gray-400">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
          </div>
        ) : (
          <div>Click on the map to select a location</div>
        )}
      </div>
    </div>
  );
}
