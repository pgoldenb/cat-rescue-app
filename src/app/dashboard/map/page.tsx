'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleMap from '@/components/map/google-map';
import CatMarker from '@/components/map/cat-marker';
import { CatStatus } from '@prisma/client';

interface Cat {
  id: string;
  name?: string;
  status: CatStatus;
  latitude: number;
  longitude: number;
  gender: string;
  estimatedAge?: string;
  description?: string;
  imageUrl?: string;
}

const statusColors = {
  TNRED: '#10B981',
  NOT_TNRED: '#EF4444',
  RESCUED: '#3B82F6',
  DECEASED: '#6B7280',
  MISSING: '#F59E0B'
};

export default function MapPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<CatStatus[]>(Object.keys(statusColors) as CatStatus[]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch('/api/cats');
        if (!response.ok) {
          throw new Error('Failed to fetch cats');
        }
        const data = await response.json();
        setCats(data);
      } catch (err) {
        console.error('Error fetching cats:', err);
        setError('Failed to load cats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCats();
    }
  }, [session]);

  const filteredCats = cats.filter(cat => selectedStatuses.includes(cat.status));

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // If we have cats, fit the map to show all of them
    if (cats.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      cats.forEach(cat => {
        bounds.extend({ lat: Number(cat.latitude), lng: Number(cat.longitude) });
      });
      mapInstance.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(mapInstance, 'bounds_changed', () => {
        if (mapInstance.getZoom()! > 16) {
          mapInstance.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [cats]);

  const toggleStatus = (status: CatStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cat Map</h1>
              <p className="text-sm text-gray-600">
                Showing {filteredCats.length} of {cats.length} cats
              </p>
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {Object.entries(statusColors).map(([status, color]) => (
              <button
                key={status}
                onClick={() => toggleStatus(status as CatStatus)}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedStatuses.includes(status as CatStatus)
                    ? 'bg-gray-100 text-gray-900 border border-gray-300'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                <span 
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: color }}
                ></span>
                {status === 'TNRED' ? 'TNR\'ed' : 
                 status === 'NOT_TNRED' ? 'Not TNR\'ed' : 
                 status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMap
          center={{ lat: 40.7128, lng: -74.0060 }}
          zoom={12}
          className="w-full h-full"
          onMapLoad={handleMapLoad}
        >
          {map && filteredCats.map(cat => (
            <CatMarker
              key={cat.id}
              cat={cat}
              map={map}
            />
          ))}
        </GoogleMap>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h3 className="font-medium text-gray-900 mb-2">Legend</h3>
          <div className="space-y-1">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center text-xs">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="text-gray-700">
                  {status === 'TNRED' ? 'TNR\'ed' : 
                   status === 'NOT_TNRED' ? 'Not TNR\'ed' : 
                   status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Click markers for details
          </div>
        </div>

        {/* Stats */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Total Cats</div>
          <div className="text-2xl font-bold text-gray-900">{cats.length}</div>
          <div className="mt-2 space-y-1">
            {Object.entries(statusColors).map(([status, color]) => {
              const count = cats.filter(cat => cat.status === status).length;
              return (
                <div key={status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-gray-600">
                      {status === 'TNRED' ? 'TNR\'ed' : 
                       status === 'NOT_TNRED' ? 'Not TNR\'ed' : 
                       status.charAt(0) + status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
