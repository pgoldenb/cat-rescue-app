'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LocationPicker from '@/components/map/location-picker'

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
  const [error, setError] = useState('')
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

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address || prev.address
    }))
  }, [])

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
          
          <LocationPicker
            initialLocation={
              formData.latitude && formData.longitude
                ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
                : undefined
            }
            onLocationSelect={handleLocationSelect}
            className="w-full h-80"
          />

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
