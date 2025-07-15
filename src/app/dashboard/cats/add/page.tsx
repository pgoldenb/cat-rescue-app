import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CatForm } from '@/components/cats/cat-form'

export default async function AddCatPage() {
  const session = await getServerSession(authOptions)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Cat</h1>
          <p className="text-gray-600 mt-2">
            Register a new cat in the TNR program
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <CatForm />
        </div>
      </div>
    </DashboardLayout>
  )
}
