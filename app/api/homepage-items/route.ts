import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Fetch approved items from the requests API
    const requestsResponse = await fetch(`${request.nextUrl.origin}/api/requests`)
    const requestsData = await requestsResponse.json()
    
    // Also fetch from main collections as fallback
    const [categoriesResponse, citiesResponse] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/categories`),
      fetch(`${request.nextUrl.origin}/api/cities`)
    ])
    
    const categoriesData = await categoriesResponse.json()
    const citiesData = await citiesResponse.json()

    let approvedCategories = []
    let approvedCities = []

    // First, get approved items from requests that should show on home page
    if (requestsData.success) {
      const requests = requestsData.requests || []
      
      approvedCategories = requests.filter((req: any) => 
        req.type === 'category' && 
        req.status === 'approved' && 
        req.show_on_home === true
      ).map((req: any) => ({
        name: req.name,
        image: req.image_url || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop'
      }))

      approvedCities = requests.filter((req: any) => 
        req.type === 'city' && 
        req.status === 'approved' && 
        req.show_on_home === true
      ).map((req: any) => ({
        name: req.name,
        state: req.state,
        country: req.country,
        image: req.image_url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
      }))
    }

    // If no approved items from requests, fallback to items from main collections
    if (approvedCategories.length === 0 && categoriesData.categories) {
      approvedCategories = categoriesData.categories
        .filter((cat: any) => cat.show_on_home || cat.selected)
        .map((cat: any) => ({
          name: cat.name,
          image: cat.image
        }))
    }

    if (approvedCities.length === 0 && citiesData.cities) {
      approvedCities = citiesData.cities
        .filter((city: any) => city.show_on_home || city.selected)
        .map((city: any) => ({
          name: city.name,
          image: city.image
        }))
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        categories: approvedCategories,
        cities: approvedCities
      }
    })
  } catch (error) {
    console.error('Homepage items API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch homepage items' }, { status: 500 })
  }
}