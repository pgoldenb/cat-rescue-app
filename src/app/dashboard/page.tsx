import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session?.user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Cat Rescue & TNR Management Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Cats
            </h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Tracked in system</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              TNR Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Successfully TNRed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Active Caretakers
            </h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Registered caretakers</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cat & Caretaker Map
            </h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">Map will be displayed here</p>
                <p className="text-gray-400 text-sm">Google Maps integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
