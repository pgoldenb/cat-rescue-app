import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { transformCatsForClient } from '@/lib/data-transform'
import Link from 'next/link'

export default async function CatsPage() {
  const session = await getServerSession(authOptions)
  
  const rawCats = await prisma.cat.findMany({
    include: {
      createdBy: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const cats = transformCatsForClient(rawCats)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cats</h1>
            <p className="text-gray-600 mt-2">
              Manage cats in the TNR program
            </p>
          </div>
          <Link
            href="/dashboard/cats/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Add Cat
          </Link>
        </div>

        {cats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cats yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first cat to the system.</p>
            <Link
              href="/dashboard/cats/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add First Cat
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {cats.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/dashboard/cats/${cat.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {cat.imageUrl ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover"
                                src={cat.imageUrl}
                                alt={cat.name || 'Cat'}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {cat.name || 'Unnamed Cat'}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                cat.status === 'TNRED' ? 'bg-green-100 text-green-800' :
                                cat.status === 'RESCUED' ? 'bg-blue-100 text-blue-800' :
                                cat.status === 'NOT_TNRED' ? 'bg-yellow-100 text-yellow-800' :
                                cat.status === 'DECEASED' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {cat.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="capitalize">{cat.gender.toLowerCase()}</span>
                              {cat.estimatedAge && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{cat.estimatedAge}</span>
                                </>
                              )}
                              <span className="mx-1">•</span>
                              <span>Added by {cat.createdBy.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <time dateTime={cat.dateAdded.toISOString()}>
                            {cat.dateAdded.toLocaleDateString()}
                          </time>
                          <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      {cat.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
