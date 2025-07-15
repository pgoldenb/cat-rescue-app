// Utility functions for geocoding and location handling

export interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

/**
 * Convert coordinates to a human-readable address using Google Geocoding API
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found')
      return null
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      // Return the formatted address of the first result
      return data.results[0].formatted_address
    }

    return null
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    return null
  }
}

/**
 * Convert an address to coordinates using Google Geocoding API
 */
export async function forwardGeocode(address: string): Promise<LocationData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found')
      return null
    }

    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Geocoding request failed')
    }

    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address
      }
    }

    return null
  } catch (error) {
    console.error('Error in forward geocoding:', error)
    return null
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

/**
 * Get a short address (remove country and postal code for cleaner display)
 */
export function getShortAddress(fullAddress: string): string {
  // Remove common suffixes like country and postal codes
  const parts = fullAddress.split(', ')
  
  // Keep first 2-3 parts (street, city, state) and remove country/postal
  if (parts.length > 3) {
    return parts.slice(0, 3).join(', ')
  }
  
  return fullAddress
}
