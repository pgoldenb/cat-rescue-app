import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { CatDetail } from '@/components/cats/cat-detail'
import { transformCatForClient } from '@/lib/data-transform'
import { notFound } from 'next/navigation'

interface CatDetailPageProps {
  params: {
    id: string
  }
}

export default async function CatDetailPage({ params }: CatDetailPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params
  
  const cat = await prisma.cat.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { name: true, email: true }
      },
      updatedBy: {
        select: { name: true, email: true }
      },
      statusHistory: {
        include: {
          updatedBy: {
            select: { name: true }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      }
    }
  })

  if (!cat) {
    notFound()
  }

  const transformedCat = transformCatForClient(cat)

  return (
    <DashboardLayout>
      <CatDetail cat={transformedCat} />
    </DashboardLayout>
  )
}
