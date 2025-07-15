import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reverseGeocode } from '@/lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cats = await prisma.cat.findMany({
      include: {
        createdBy: {
          select: { name: true }
        },
        updatedBy: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cats)
  } catch (error) {
    console.error('Error fetching cats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      gender,
      status,
      estimatedAge,
      description,
      microchipInfo,
      latitude,
      longitude,
      address
    } = body

    // Validate required fields
    if (!gender || !status || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Gender, status, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    // Validate enums
    const validGenders = ['MALE', 'FEMALE', 'UNKNOWN']
    const validStatuses = ['NOT_TNRED', 'TNRED', 'RESCUED', 'DECEASED', 'MISSING']

    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      )
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Validate coordinates
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90, longitude between -180 and 180' },
        { status: 400 }
      )
    }

    // Try to get address from coordinates if not provided
    let finalAddress = address
    if (!finalAddress && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      try {
        const geocodedAddress = await reverseGeocode(lat, lng)
        if (geocodedAddress) {
          finalAddress = geocodedAddress
        }
      } catch (error) {
        console.warn('Failed to reverse geocode coordinates:', error)
        // Continue without address - it's optional
      }
    }

    // Create the cat
    const cat = await prisma.cat.create({
      data: {
        name: name || null,
        gender,
        status,
        estimatedAge: estimatedAge || null,
        description: description || null,
        microchipInfo: microchipInfo || null,
        latitude: lat,
        longitude: lng,
        address: finalAddress || null,
        createdById: session.user.id,
        updatedById: session.user.id
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    })

    // Create initial status history entry
    await prisma.catStatusHistory.create({
      data: {
        catId: cat.id,
        oldStatus: null,
        newStatus: status,
        notes: 'Initial cat registration',
        updatedById: session.user.id
      }
    })

    return NextResponse.json(cat, { status: 201 })
  } catch (error) {
    console.error('Error creating cat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
