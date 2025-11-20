import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photographerId = params.id
    console.log('Fetching photographer with ID:', photographerId)

    const client = await clientPromise
    const db = client.db('photobook')

    // Use studios collection as primary source since photographers register as studios
    const studios = db.collection('studios')

    // Find photographer by ID
    let photographer: any

    // First try as ObjectId
    if (ObjectId.isValid(photographerId)) {
      console.log('Trying as ObjectId in studios collection')
      photographer = await studios.findOne({ _id: new ObjectId(photographerId) })
      console.log('Found in studios (ObjectId):', !!photographer)
    }

    // If not found, try as string ID
    if (!photographer) {
      console.log('Trying as string ID in studios collection')
      photographer = await studios.findOne({ _id: photographerId as any })
      console.log('Found in studios (string):', !!photographer)
    }

    if (!photographer) {
      console.log('Photographer not found in any collection')
      return NextResponse.json(
        { success: false, error: 'Photographer not found' },
        { status: 404 }
      )
    }

    console.log('Found photographer:', photographer.name || photographer.fullName)

    // Fetch real data from collections
    const galleries = db.collection('photographer_galleries')
    const stories = db.collection('photographer_stories')
    const packages = db.collection('photographer_packages')
    const profiles = db.collection('photographer_profiles')
    const likes = db.collection('likes')
    const comments = db.collection('comments')
    const reviews = db.collection('reviews') // Add reviews collection

    // Get photographer's galleries (ALL galleries - approved, pending, rejected)
    const photographerGalleries = await galleries.find({
      photographerId: photographerId
    }).toArray()

    // Get photographer's stories (ALL stories - approved, pending, rejected)
    const photographerStories = await stories.find({
      photographerId: photographerId
    }).toArray()

    // Get photographer's packages (ALL packages - active and inactive)
    const photographerPackages = await packages.find({
      photographerId: photographerId
    }).toArray()

    // Get photographer's profile
    const photographerProfile: any = await profiles.findOne({ photographerId })
    
    // Get photographer's reviews
    const photographerReviews = await reviews.find({
      photographerId: photographerId
    }).toArray()

    console.log('Found profile data:', !!photographerProfile)
    console.log('Found galleries:', photographerGalleries.length)
    console.log('Found stories:', photographerStories.length)
    console.log('Found packages:', photographerPackages.length)
    console.log('Found reviews:', photographerReviews.length)

    // Log package details
    if (photographerPackages.length > 0) {
      console.log('Package details:', photographerPackages.map(pkg => ({
        id: pkg._id.toString(),
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        isActive: pkg.isActive,
        features: pkg.features?.length || 0
      })));
    } else {
      console.log('No packages found for photographer:', photographerId);
      // Check if any packages exist at all
      const allPackages = await packages.find({}).toArray();
      console.log('Total packages in database:', allPackages.length);
      console.log('Sample package photographerIds:', allPackages.slice(0, 3).map(p => p.photographerId));
    }

    // Build portfolio from galleries and stories
    const portfolio = []

    // Add gallery images to portfolio with likes and comments count
    for (const gallery of photographerGalleries) {
      // Get likes and comments count for this gallery
      const galleryLikes = await likes.countDocuments({ contentId: gallery._id.toString() })
      const galleryComments = await comments.countDocuments({ contentId: gallery._id.toString() })
      
      if (gallery.images && gallery.images.length > 0) {
        gallery.images.forEach((image: string, index: number) => {
          portfolio.push({
            id: `gallery-${gallery._id}-${index}`,
            type: 'photo',
            url: image,
            thumbnail: image,
            eventType: gallery.category || gallery.name || 'Gallery',
            location: gallery.location || photographer.location || photographer.city || 'Location',
            title: `${gallery.name || 'Gallery'} - Image ${index + 1}`,
            likes: galleryLikes,
            comments: galleryComments
          })
        })
      }
    }

    // Add story images to portfolio with likes and comments count
    for (const story of photographerStories) {
      // Get likes and comments count for this story
      const storyLikes = await likes.countDocuments({ contentId: story._id.toString() })
      const storyComments = await comments.countDocuments({ contentId: story._id.toString() })
      
      if (story.coverImage) {
        portfolio.push({
          id: `story-${story._id}`,
          type: 'photo',
          url: story.coverImage,
          thumbnail: story.coverImage,
          eventType: story.category || 'Story',
          location: story.location || photographer.location || photographer.city || 'Location',
          title: story.title || 'Story',
          likes: storyLikes,
          comments: storyComments
        })
      }
    }

    console.log('Built portfolio with', portfolio.length, 'items')
    console.log('Found stories:', photographerStories.length)
    console.log('Found galleries:', photographerGalleries.length)

    // Transform packages
    const transformedPackages = photographerPackages.map(pkg => ({
      id: pkg._id.toString(),
      name: pkg.name || 'Unnamed Package',
      price: pkg.price || 0,
      duration: pkg.duration || 'Not specified',
      deliverables: pkg.deliverables || [],
      features: pkg.features || [],
      isPopular: pkg.isPopular || false,
      description: pkg.description || '',
      category: pkg.category || 'General'
    }))

    console.log('Transformed packages:', transformedPackages.length)
    if (transformedPackages.length > 0) {
      console.log('Sample transformed package:', transformedPackages[0]);
    }

    // Transform reviews
    const transformedReviews = photographerReviews.map(review => ({
      id: review._id.toString(),
      userName: review.clientName || 'Anonymous',
      userAvatar: '', // We can add avatar logic later
      rating: review.rating || 0,
      comment: review.comment || '',
      date: review.createdAt || new Date().toISOString(),
      eventType: review.eventType || 'General',
      clientEmail: review.clientEmail || '' // Add clientEmail for identification
    }))

    // Calculate average rating
    let averageRating = 0
    if (transformedReviews.length > 0) {
      const totalRating = transformedReviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / transformedReviews.length
    }

    // Use profile data if available, otherwise use photographer data
    const profileData: any = photographerProfile || {}
    console.log('Profile data keys:', Object.keys(profileData))
    console.log('Photographer data keys:', Object.keys(photographer))

    // Transform data for frontend
    const photographerData = {
      id: photographer._id?.toString() || photographer.id,
      name: profileData.name || photographer.fullName || photographer.name || photographer.email || '',
      studioName: profileData.studioName || photographer.studioName || photographer.fullName || photographer.name || '',
      profilePhoto: profileData.profileImage || photographer.profileImage || photographer.image || '',
      studioBannerImage: profileData.studioBannerImage || photographer.studioBannerImage || photographer.bannerImage || '',
      isVerified: photographer.isVerified || photographer.verified || false,
      location: profileData.location || photographer.location || photographer.city || '',
      tagline: profileData.bio ? profileData.bio.substring(0, 100) + (profileData.bio.length > 100 ? '...' : '') : '',
      bio: profileData.bio || photographer.description || photographer.bio || '',
      experience: profileData.experience || photographer.experience || 0,
      specializations: profileData.specializations || photographer.categories || photographer.services || [],
      awards: profileData.awards || [],
      portfolio: portfolio,
      packages: transformedPackages,
      reviews: transformedReviews,
      averageRating: averageRating,
      totalReviews: transformedReviews.length,
      availability: photographer.availability || [],
      contact: {
        phone: profileData.phone || photographer.phone || photographer.mobile || '',
        email: profileData.email || photographer.email || '',
        instagram: profileData.socialMedia?.instagram || photographer.instagram || '',
        facebook: profileData.socialMedia?.facebook || photographer.facebook || '',
        website: profileData.socialMedia?.website || photographer.website || ''
      },
      stats: {
        totalBookings: photographerGalleries.length + photographerStories.length,
        yearsActive: profileData.experience || photographer.experience || 0,
        happyClients: photographerGalleries.length + photographerStories.length
      },
      // Additional studio information
      studioInfo: {
        studioName: profileData.studioName || photographer.studioName || '',
        studioAddress: profileData.studioAddress || photographer.address || '',
        studioCity: profileData.studioCity || photographer.city || '',
        studioState: profileData.studioState || photographer.state || '',
        studioPincode: profileData.studioPincode || photographer.pincode || '',
        studioEstablished: profileData.studioEstablished || photographer.established || '',
        studioTeamSize: profileData.studioTeamSize || photographer.teamSize || 1,
        studioServices: profileData.studioServices || photographer.services || [],
        studioEquipment: profileData.studioEquipment || photographer.equipment || [],
        businessHours: profileData.businessHours || photographer.businessHours || {},
        emergencyContact: profileData.emergencyContact || photographer.emergencyContact || '',
        alternateEmail: profileData.alternateEmail || photographer.alternateEmail || ''
      }
    }

    console.log('Final photographer data:', {
      name: photographerData.name,
      bio: photographerData.bio,
      experience: photographerData.experience,
      portfolioCount: photographerData.portfolio.length,
      packagesCount: photographerData.packages.length,
      reviewsCount: photographerData.reviews.length,
      averageRating: photographerData.averageRating
    })

    return NextResponse.json({
      success: true,
      photographer: photographerData
    })

  } catch (error) {
    console.error('Error fetching photographer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photographer data' },
      { status: 500 }
    )
  }
}
