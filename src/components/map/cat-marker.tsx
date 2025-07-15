'use client';

import { useEffect, useState } from 'react';
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

interface CatMarkerProps {
  cat: Cat;
  map: google.maps.Map;
  onClick?: (cat: Cat) => void;
}

const getMarkerColor = (status: CatStatus): string => {
  switch (status) {
    case 'TNRED':
      return '#10B981'; // Green
    case 'NOT_TNRED':
      return '#EF4444'; // Red
    case 'RESCUED':
      return '#3B82F6'; // Blue
    case 'DECEASED':
      return '#6B7280'; // Gray
    case 'MISSING':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

const getStatusLabel = (status: CatStatus): string => {
  switch (status) {
    case 'TNRED':
      return 'TNR\'ed';
    case 'NOT_TNRED':
      return 'Not TNR\'ed';
    case 'RESCUED':
      return 'Rescued';
    case 'DECEASED':
      return 'Deceased';
    case 'MISSING':
      return 'Missing';
    default:
      return status;
  }
};

const createCatIcon = (color: string): string => {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">🐱</text>
    </svg>
  `)}`;
};

export default function CatMarker({ cat, map, onClick }: CatMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    const markerColor = getMarkerColor(cat.status);
    const icon = createCatIcon(markerColor);

    const newMarker = new google.maps.Marker({
      position: { lat: Number(cat.latitude), lng: Number(cat.longitude) },
      map,
      title: cat.name || `Cat ${cat.id.slice(-6)}`,
      icon: {
        url: icon,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      }
    });

    const infoContent = `
      <div class="p-3 max-w-xs">
        ${cat.imageUrl ? `<img src="${cat.imageUrl}" alt="Cat photo" class="w-full h-32 object-cover rounded mb-2" />` : ''}
        <h3 class="font-semibold text-lg mb-1">${cat.name || `Cat ${cat.id.slice(-6)}`}</h3>
        <div class="space-y-1 text-sm">
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 rounded-full" style="background-color: ${markerColor}"></span>
            <span class="font-medium">${getStatusLabel(cat.status)}</span>
          </div>
          <div><strong>Gender:</strong> ${cat.gender}</div>
          ${cat.estimatedAge ? `<div><strong>Age:</strong> ${cat.estimatedAge}</div>` : ''}
          ${cat.description ? `<div><strong>Description:</strong> ${cat.description.length > 100 ? cat.description.substring(0, 100) + '...' : cat.description}</div>` : ''}
        </div>
        <button 
          onclick="window.viewCatDetails('${cat.id}')" 
          class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
      </div>
    `;

    const newInfoWindow = new google.maps.InfoWindow({
      content: infoContent
    });

    newMarker.addListener('click', () => {
      // Close any open info windows
      if (window.currentInfoWindow) {
        window.currentInfoWindow.close();
      }
      
      newInfoWindow.open(map, newMarker);
      window.currentInfoWindow = newInfoWindow;
      
      if (onClick) {
        onClick(cat);
      }
    });

    // Set up global function for view details button
    if (typeof window !== 'undefined') {
      window.viewCatDetails = (catId: string) => {
        window.location.href = `/dashboard/cats/${catId}`;
      };
    }

    setMarker(newMarker);
    setInfoWindow(newInfoWindow);

    return () => {
      newMarker.setMap(null);
      newInfoWindow.close();
    };
  }, [cat, map, onClick]);

  return null; // This component doesn't render anything directly
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    viewCatDetails: (catId: string) => void;
    currentInfoWindow: google.maps.InfoWindow | null;
  }
}
