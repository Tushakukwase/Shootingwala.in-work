import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const photographerId = searchParams.get('id')
    
    if (!photographerId) {
      return NextResponse.json(
        { success: false, error: 'Photographer ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('photobook')
    const profiles = db.collection('photographer_profiles')
    
    const profile = await profiles.findOne({ photographerId })
    
    return NextResponse.json({
      success: true,
      profile: profile || null
    })
    
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for photographer profile')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const {
      photographerId,
      name,
      email,
      phone,
      location,
      bio,
      experience,
      specializations,
      awards,
      profileImage,
      socialMedia,
      // Studio Information
      studioName,
      studioAddress,
      studioCity,
      studioState,
      studioPincode,
      studioEstablished,
      studioTeamSize,
      studioServices,
      studioEquipment,
      businessHours,
      emergencyContact,
      alternateEmail,
      studioBannerImage
    } = body
    
    console.log('Extracted data:', { photographerId, name, email })
    
    if (!photographerId || !name || !email) {
      console.log('Validation failed:', { photographerId: !!photographerId, name: !!name, email: !!email })
      return NextResponse.json(
        { success: false, error: 'Photographer ID, name, and email are required' },
        { status: 400 }
      )
    }

    console.log('Connecting to MongoDB...')
    const client = await clientPromise
    const db = client.db('photobook')
    const profiles = db.collection('photographer_profiles')
    console.log('Connected to MongoDB successfully')
    
    const profileData = {
      photographerId,
      name,
      email,
      phone: phone || '',
      location: location || '',
      bio: bio || '',
      experience: experience || 0,
      specializations: specializations || [],
      awards: awards || [],
      profileImage: profileImage || '',
      socialMedia: socialMedia || {},
      // Studio Information
      studioName: studioName || '',
      studioAddress: studioAddress || '',
      studioCity: studioCity || '',
      studioState: studioState || '',
      studioPincode: studioPincode || '',
      studioEstablished: studioEstablished || '',
      studioTeamSize: studioTeamSize || 1,
      studioServices: studioServices || [],
      studioEquipment: studioEquipment || [],
      businessHours: businessHours || {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: 'Closed'
      },
      emergencyContact: emergencyContact || '',
      alternateEmail: alternateEmail || '',
      studioBannerImage: studioBannerImage || '',
      updatedAt: new Date()
    }
    
    console.log('Storing profile data in studios collection only...')
    // Store profile data in the profiles collection for backward compatibility (optional)
    const result = await profiles.updateOne(
      { photographerId },
      { 
        $set: profileData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    )
    console.log('Profile upsert result:', result)
    
    // Update only the studios collection since photographer data is stored there
    console.log('Updating studios collection...')
    const studios = db.collection('studios')
    
    let studioQuery: any = {}
    if (ObjectId.isValid(photographerId)) {
      studioQuery._id = new ObjectId(photographerId)
    } else {
      studioQuery._id = photographerId
    }
    
    console.log('Studio query:', studioQuery)
    
    const studioResult = await studios.updateOne(
      studioQuery,
      {
        $set: {
          // Personal Information
          fullName: name,
          photographerName: name,
          email,
          mobile: phone,
          location,
          description: bio,
          bio: bio,
          experience,
          
          // Studio Information
          name: studioName || name,
          studioName: studioName,
          address: studioAddress,
          studioAddress: studioAddress,
          city: studioCity,
          studioCity: studioCity,
          state: studioState,
          studioState: studioState,
          pincode: studioPincode,
          studioPincode: studioPincode,
          established: studioEstablished,
          studioEstablished: studioEstablished,
          teamSize: studioTeamSize,
          studioTeamSize: studioTeamSize,
          
          // Services & Categories
          categories: specializations,
          specializations: specializations,
          services: studioServices,
          studioServices: studioServices,
          equipment: studioEquipment,
          studioEquipment: studioEquipment,
          
          // Business Information
          businessHours: businessHours,
          emergencyContact: emergencyContact,
          alternateEmail: alternateEmail,
          
          // Images
          image: profileImage,
          profileImage: profileImage,
          bannerImage: studioBannerImage,
          studioBannerImage: studioBannerImage,
          
          // Social Media
          instagram: socialMedia?.instagram,
          facebook: socialMedia?.facebook,
          website: socialMedia?.website,
          socialMedia: socialMedia,
          
          // Awards
          awards: awards,
          
          updatedAt: new Date()
        }
      }
    )
    console.log('Studio update result:', studioResult)

    console.log('All updates completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error saving profile:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: `Failed to save profile: ${error.message}` },
      { status: 500 }
    )
  }
}