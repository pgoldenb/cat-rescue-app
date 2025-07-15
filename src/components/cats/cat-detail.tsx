'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CatDetailProps {
  cat: {
    id: string
    name: string | null
    gender: string
    status: string
    estimatedAge: string | null
    description: string | null
    microchipInfo: string | null
    latitude: number
    longitude: number
    address: string | null
    imageUrl: string | null
    dateAdded: Date
    createdAt: Date
    updatedAt: Date
    createdBy: {
      name: string
      email: string
    }
    updatedBy: {
      name: string
      email: string
    }
    statusHistory: Array<{
      id: string
      oldStatus: string | null
      newStatus: string
      notes: string | null
      updatedAt: Date
      updatedBy: {
        name: string
      }
    }>
  }
}

export function CatDetail({ cat }: CatDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TNRED':
        return 'bg-green-100 text-green-800'
      case 'RESCUED':
        return 'bg-blue-100 text-blue-800'
      case 'NOT_TNRED':
        return 'bg-yellow-100 text-yellow-800'
      case 'DECEASED':
        return 'bg-gray-100 text-gray-800'
      case 'MISSING':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ')
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/cats"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {cat.name || 'Unnamed Cat'}
              </h1>
              <p className="text-gray-600 mt-1">
                Cat ID: {cat.id}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cat.status)}`}>
              {formatStatus(cat.status)}
            </span>
            <Link
              href={`/dashboard/cats/${cat.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Status History
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.name || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{cat.gender.toLowerCase()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cat.status)}`}>
                      {formatStatus(cat.status)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Age</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.estimatedAge || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Microchip</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.microchipInfo || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date Added</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.dateAdded.toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            {cat.description && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{cat.description}</p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              {cat.address ? (
                <div className="mb-4">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-base text-gray-900">{cat.address}</dd>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">No address available</p>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-xs font-medium text-gray-400">Latitude</dt>
                  <dd className="mt-1 text-xs text-gray-600">{cat.latitude.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400">Longitude</dt>
                  <dd className="mt-1 text-xs text-gray-600">{cat.longitude.toFixed(6)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <a
                  href={`https://www.google.com/maps?q=${cat.latitude},${cat.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {cat.imageUrl && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Photo</h3>
                <img
                  src={cat.imageUrl}
                  alt={cat.name || 'Cat'}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created by</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.createdBy.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last updated by</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.updatedBy.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cat.updatedAt.toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Status History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {cat.statusHistory.map((entry) => (
              <div key={entry.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {entry.oldStatus && (
                        <>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.oldStatus)}`}>
                            {formatStatus(entry.oldStatus)}
                          </span>
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.newStatus)}`}>
                        {formatStatus(entry.newStatus)}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-gray-600">{entry.notes}</p>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Updated by {entry.updatedBy.name} on {entry.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
