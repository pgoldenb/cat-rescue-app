'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // New York City
const DEFAULT_ZOOM = 12;

export default function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "w-full h-96",
  onMapLoad,
  children
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        // Check if API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        console.log('Initializing Google Maps with API key:', apiKey.substring(0, 10) + '...');

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const { Map } = await loader.importLibrary('maps');
        
        const mapInstance = new Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('Google Maps initialized successfully');
        setMap(mapInstance);
        onMapLoad?.(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        let errorMessage = 'Failed to load map.';
        
        if (err instanceof Error) {
          if (err.message.includes('API key')) {
            errorMessage = 'Google Maps API key is missing or invalid.';
          } else if (err.message.includes('quota')) {
            errorMessage = 'Google Maps API quota exceeded.';
          } else if (err.message.includes('billing')) {
            errorMessage = 'Google Maps billing is not enabled.';
          } else {
            errorMessage = `Map error: ${err.message}`;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.lat, center.lng, zoom, onMapLoad]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      {isLoading && (
        <div className={`absolute inset-0 ${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {map && children}
    </div>
  );
}
