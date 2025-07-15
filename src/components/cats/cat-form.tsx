'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { forwardGeocode } from '@/lib/geocoding'

interface CatFormData {
  name: string
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN'
  status: 'NOT_TNRED' | 'TNRED' | 'RESCUED' | 'DECEASED' | 'MISSING'
  estimatedAge: string
  description: string
  microchipInfo: string
  latitude: string
  longitude: string
  address: string
}

export function CatForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState<CatFormData>({
    name: '',
    gender: 'UNKNOWN',
    status: 'NOT_TNRED',
    estimatedAge: '',
    description: '',
    microchipInfo: '',
    latitude: '',
    longitude: '',
    address: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Unable to get current location. Please enter an address or coordinates manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  const handleAddressLookup = async () => {
    if (!formData.address.trim()) {
      setError('Please enter an address')
      return
    }

    setIsGeocodingLoading(true)
    setError('')

    try {
      const result = await forwardGeocode(formData.address)
      if (result) {
        setFormData(prev => ({
          ...prev,
          latitude: result.latitude.toString(),
          longitude: result.longitude.toString(),
          address: result.address || prev.address
        }))
      } else {
        setError('Unable to find coordinates for this address. Please try a different address or enter coordinates manually.')
      }
    } catch (error) {
      setError('Error looking up address. Please try again or enter coordinates manually.')
    } finally {
      setIsGeocodingLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate required fields
    if (!formData.latitude || !formData.longitude) {
      setError('Location coordinates are required')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/cats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        }),
      })

      if (response.ok) {
        router.push('/dashboard/cats')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create cat')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter cat's name if known"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="UNKNOWN">Unknown</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              TNR Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="NOT_TNRED">Not TNR'd</option>
              <option value="TNRED">TNR'd</option>
              <option value="RESCUED">Rescued</option>
              <option value="DECEASED">Deceased</option>
              <option value="MISSING">Missing</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimatedAge" className="block text-sm font-medium text-gray-700">
              Estimated Age
            </label>
            <input
              type="text"
              id="estimatedAge"
              name="estimatedAge"
              value={formData.estimatedAge}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 2 years, 6 months, kitten"
            />
          </div>
        </div>

        {/* Location and Additional Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Location & Details</h3>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="space-y-3">
              {/* Address Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter street address (e.g., 123 Main St, Portland, OR)"
                />
                <button
                  type="button"
                  onClick={handleAddressLookup}
                  disabled={isGeocodingLoading || !formData.address.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  {isGeocodingLoading ? 'Looking up...' : 'Find Location'}
                </button>
              </div>

              {/* Current Location Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Use Current Location
              </button>

              {/* Show coordinates if available */}
              {(formData.latitude && formData.longitude) && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="text-sm text-green-800">
                    ✓ Location found: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                  </div>
                </div>
              )}

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {showAdvanced ? 'Hide' : 'Show'} advanced options
              </button>

              {/* Advanced Coordinate Input */}
              {showAdvanced && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs text-gray-500">Enter coordinates manually if needed:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Latitude"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Longitude"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="microchipInfo" className="block text-sm font-medium text-gray-700">
              Microchip Information
            </label>
            <input
              type="text"
              id="microchipInfo"
              name="microchipInfo"
              value={formData.microchipInfo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Microchip number if available"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Physical description, behavior notes, location details..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Link
          href="/dashboard/cats"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Adding Cat...' : 'Add Cat'}
        </button>
      </div>
    </form>
  )
}
