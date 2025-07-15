import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@catrescue.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@catrescue.com',
      password: hashedPassword,
      status: 'APPROVED',
      isAdmin: true
    }
  })

  console.log('✅ Created admin user:', {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    isAdmin: adminUser.isAdmin,
    status: adminUser.status
  })

  console.log('🎉 Database seed completed!')
  console.log('')
  console.log('📝 Admin Login Credentials:')
  console.log('   Email: admin@catrescue.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('⚠️  Remember to change the admin password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
