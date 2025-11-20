import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, location, categories, image, description, experience, rating, createdBy, startingPrice, tags } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('photobook');
    
    // Use studios collection since photographers register as studios
    const studios = db.collection('studios');

    // Prevent duplicate photographer emails
    const existing = await studios.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'A photographer with this email already exists.' }, { status: 409 });
    }

    const newStudio = {
      // Personal Information
      fullName: name,
      photographerName: name,
      name: name,
      email: email.toLowerCase(),
      mobile: phone || '',
      phone: phone || '',
      location: location || '',
      
      // Studio Information
      studioName: `${name} Studio`,
      description: description || '',
      bio: description || '',
      
      // Professional Information
      categories: Array.isArray(categories) ? categories : [],
      specializations: Array.isArray(categories) ? categories : [],
      experience: experience || 0,
      startingPrice: startingPrice || 200,
      
      // Images
      image: image || null,
      profileImage: image || null,
      
      // Status & Verification
      isActive: createdBy === 'admin' ? true : false,
      status: createdBy === 'admin' ? 'approved' : 'pending',
      isVerified: false,
      emailVerified: true,
      mobileVerified: true,
      
      // Metadata
      createdBy: createdBy || 'self',
      rating: createdBy === 'admin' ? 0 : (rating || 0),
      tags: tags || categories || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      registrationDate: new Date(),
    };
    
    const result = await studios.insertOne(newStudio);
    return NextResponse.json({ ...newStudio, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding photographer:', error);
    return NextResponse.json({ error: 'Failed to add photographer', details: error?.message || error?.toString() }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const approved = searchParams.get('approved');
    const userId = searchParams.get('userId');
    const personalized = searchParams.get('personalized');
    const categories = searchParams.get('categories');
    const location = searchParams.get('location');
    const priceRange = searchParams.get('priceRange');
    const search = searchParams.get('search'); // Add search parameter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 items per page
    
    const client = await clientPromise;
    const db = client.db('photobook');
    
    // Use studios collection as the primary source since photographers register as studios
    const studios = db.collection('studios');
    const reviews = db.collection('reviews'); // Add reviews collection
    const packages = db.collection('photographer_packages'); // Add packages collection
    
    let query: any = {};
    
    // Handle search query
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { photographerName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { studioName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { categories: { $in: [new RegExp(search, 'i')] } },
        { specializations: { $in: [new RegExp(search, 'i')] } }
      ];
      // For search, only show approved photographers
      query.isActive = true;
      query.status = 'approved';
    }
    
    // Only show approved studios
    if (approved === 'true') {
      query.isActive = true;
      query.status = 'approved';
    } else if (approved === 'false') {
      query.$or = [
        { isActive: false },
        { status: 'pending' }
      ];
    } else if (!search) {
      // If not searching and no approved filter, don't add status filter
      // This allows admin to see all photographers
    }
    
    // Handle personalized filtering
    if (personalized === 'true' && userId) {
      // Apply preference-based filtering
      if (categories) {
        const categoryList = categories.split(',');
        query.categories = { $in: categoryList };
      }
      
      if (location) {
        query.$or = [
          { location: { $regex: location, $options: 'i' } },
          { city: { $regex: location, $options: 'i' } },
          { studioCity: { $regex: location, $options: 'i' } }
        ];
      }
      
      if (priceRange) {
        // Define price ranges
        const priceRanges: { [key: string]: { min: number; max: number } } = {
          'low': { min: 0, max: 500 },
          'medium': { min: 500, max: 1500 },
          'high': { min: 1500, max: 5000 },
          'premium': { min: 5000, max: 999999 }
        };
        
        if (priceRanges[priceRange]) {
          query.startingPrice = {
            $gte: priceRanges[priceRange].min,
            $lte: priceRanges[priceRange].max
          };
        }
      }
    } else {
      // Handle regular filtering (non-personalized)
      if (category) {
        query.categories = { $in: [category] };
      }
      
      if (city) {
        query.$or = [
          { location: { $regex: city, $options: 'i' } },
          { city: { $regex: city, $options: 'i' } },
          { studioCity: { $regex: city, $options: 'i' } }
        ];
      }
    }
    
    // Fetch photographers from studios collection with optimized query
    let photographers_cursor = studios.find(query);
    
    // Apply sorting for better performance
    photographers_cursor = photographers_cursor.sort({ 
      rating: -1, 
      experience: -1, 
      createdAt: -1 
    });
    
    // Apply pagination
    const skip = (page - 1) * limit;
    photographers_cursor = photographers_cursor.skip(skip).limit(limit);
    
    let photographers_result = await photographers_cursor.toArray();
    
    // Get total count for pagination
    const total = await studios.countDocuments(query);
    
    // Get profile data for additional information (optional)
    const profiles = db.collection('photographer_profiles');
    const allProfiles = await profiles.find({}).toArray();
    
    // Create map for profile data lookup (optional enhancement)
    const profileMap = new Map<string, any>();
    
    allProfiles.forEach((profile: any) => {
      profileMap.set(profile.photographerId, profile);
    });
    
    console.log('Total studios found:', photographers_result.length);
    console.log('Total profiles found:', allProfiles.length);
    
    // Enrich studios data with profile data and actual reviews (if available)
    const enrichedPhotographers = await Promise.all(photographers_result.map(async (studio: any) => {
      const studioId = studio._id.toString();
      const profile = profileMap.get(studioId);
      
      // Fetch approved reviews for this photographer
      const photographerReviews = await reviews.find({
        photographerId: studioId
      }).toArray();
      
      // Fetch packages for this photographer
      const photographerPackages = await packages.find({
        photographerId: studioId
      }).toArray();
      
      // Transform reviews to include clientEmail
      const transformedReviews = photographerReviews.map((review: any) => ({
        _id: review._id.toString(),
        clientEmail: review.clientEmail || '',
        clientName: review.clientName || '',
        rating: review.rating || 0,
        comment: review.comment || '',
        createdAt: review.createdAt || '',
        eventType: review.eventType || '',
        photographerId: review.photographerId || '',
        bookingId: review.bookingId || '',
        approved: review.approved || false,
        response: review.response || null
      }));
      
      // Transform packages
      const transformedPackages = photographerPackages.map((pkg: any) => ({
        id: pkg._id.toString(),
        name: pkg.name || 'Unnamed Package',
        price: pkg.price || 0,
        duration: pkg.duration || 'Not specified',
        description: pkg.description || '',
        features: pkg.features || [],
        deliverables: pkg.deliverables || [],
        isPopular: pkg.isPopular || false,
        isActive: pkg.isActive !== false, // Default to true if not set
        createdAt: pkg.createdAt || new Date(),
        updatedAt: pkg.updatedAt || new Date()
      }));
      
      // Calculate average rating from reviews
      let averageRating = 0;
      if (transformedReviews.length > 0) {
        const totalRating = transformedReviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
        averageRating = totalRating / transformedReviews.length;
      }
      
      // Find the lowest active package price
      let lowestPackagePrice = null;
      const activePackages = transformedPackages.filter((pkg: any) => pkg.isActive);
      if (activePackages.length > 0) {
        const prices = activePackages.map((pkg: any) => pkg.price).filter((price: number) => !isNaN(price));
        if (prices.length > 0) {
          lowestPackagePrice = Math.min(...prices);
        }
      }
      
      // Use studio data as primary source, profile data as enhancement
      const enriched = {
        ...studio,
        // Map studio fields to photographer fields for compatibility
        name: studio.fullName || studio.photographerName || studio.name || '',
        email: studio.email || '',
        phone: studio.mobile || studio.phone || '',
        location: studio.location || studio.city || studio.studioCity || '',
        description: studio.description || studio.bio || '',
        experience: studio.experience || 0,
        categories: studio.categories || studio.specializations || [],
        image: studio.image || studio.profileImage || '',
        
        // Studio specific information
        studioName: studio.studioName || studio.name || `${studio.fullName || 'Photography'} Studio`,
        studioBannerImage: studio.studioBannerImage || studio.bannerImage || '',
        
        // Professional information
        bio: studio.bio || studio.description || '',
        specializations: studio.specializations || studio.categories || [],
        
        // Business information
        businessHours: studio.businessHours || {},
        services: studio.services || studio.studioServices || [],
        equipment: studio.equipment || studio.studioEquipment || [],
        
        // Status mapping
        isApproved: studio.isActive || false,
        status: studio.status || 'pending',
        
        // Rating and reviews data
        rating: averageRating > 0 ? averageRating : (studio.rating || 0),
        totalReviews: photographerReviews.length,
        reviews: transformedReviews,
        
        // Packages data
        packages: transformedPackages,
        // Only use the calculated package price, don't fall back to studio startingPrice
        startingPrice: lowestPackagePrice,
        
        // Default values for compatibility
        tags: studio.tags || studio.categories || [],
        completedProjects: studio.completedProjects || 0,
        
        // Profile enhancements (if available)
        ...(profile && {
          bio: profile.bio || studio.bio || studio.description || '',
          experience: profile.experience || studio.experience || 0,
          specializations: profile.specializations || studio.specializations || studio.categories || [],
          awards: profile.awards || [],
          socialMedia: profile.socialMedia || {}
        })
      };
      
      return enriched;
    }));
    
    console.log('Final enriched sample:', enrichedPhotographers.slice(0, 2).map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      studioName: p.studioName,
      studioBannerImage: p.studioBannerImage ? 'HAS_BANNER' : 'NO_BANNER',
      image: p.image ? 'HAS_IMAGE' : 'NO_IMAGE',
      rating: p.rating,
      totalReviews: p.totalReviews,
      packages: p.packages?.length || 0,
      startingPrice: p.startingPrice
    })));
    
    // Apply intelligent sorting for personalized results
    if (personalized === 'true') {
      enrichedPhotographers.sort((a: any, b: any) => {
        // Prioritize photographers with higher ratings
        if (b.rating !== a.rating) {
          return (b.rating || 0) - (a.rating || 0);
        }
        // Then by experience
        if (b.experience !== a.experience) {
          return (b.experience || 0) - (a.experience || 0);
        }
        // Finally by creation date (newer first)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else {
      // Default sorting for non-personalized results
      enrichedPhotographers.sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }
    
    return NextResponse.json({ 
      success: true,
      photographers: enrichedPhotographers.map((photographer: any) => ({
        ...photographer,
        _id: photographer._id.toString(),
        rating: photographer.rating || 0,
        totalReviews: photographer.totalReviews || 0,
        isApproved: photographer.isApproved || false,
        createdBy: photographer.createdBy || 'admin',
        startingPrice: photographer.startingPrice,
        tags: photographer.tags || photographer.categories || [],
        experience: photographer.experience || 0,
        completedProjects: photographer.completedProjects || 0,
        // Ensure studio data is included
        studioName: photographer.studioName || '',
        studioBannerImage: photographer.studioBannerImage || '',
        bannerImage: photographer.studioBannerImage || photographer.bannerImage || '',
        // Include packages data
        packages: photographer.packages || [],
        // Include categories/specializations
        categories: photographer.categories || [],
        specializations: photographer.specializations || []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      isPersonalized: personalized === 'true',
      appliedFilters: {
        categories: categories?.split(',') || [],
        location: location || null,
        priceRange: priceRange || null
      }
    });
  } catch (error: any) {
    console.error('Error fetching photographers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch photographers.',
      photographers: []
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, phone, location, categories, image, description, experience, rating } = await req.json();
    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name, and email are required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('photobook');
    const studios = db.collection('studios');
    
    // Prevent duplicate photographer emails (excluding self)
    const existing = await studios.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: new ObjectId(id) } 
    });
    if (existing) {
      return NextResponse.json({ error: 'A photographer with this email already exists.' }, { status: 409 });
    }
    
    const updateData = {
      // Personal Information
      fullName: name,
      photographerName: name,
      name: name,
      email: email.toLowerCase(),
      mobile: phone || '',
      phone: phone || '',
      location: location || '',
      
      // Professional Information
      categories: Array.isArray(categories) ? categories : [],
      specializations: Array.isArray(categories) ? categories : [],
      description: description || '',
      experience: experience || 0,
      rating: rating || 0,
      
      // Images
      image: image || null,
      profileImage: image || null,
      
      // Metadata
      updatedAt: new Date()
    };
    
    const result = await studios.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Photographer not found.' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Photographer updated successfully.' });
  } catch (error: any) {
    console.error('Error updating photographer:', error);
    return NextResponse.json({ error: 'Failed to update photographer.', details: error?.message || error?.toString() }, { status: 500 });
  }
}