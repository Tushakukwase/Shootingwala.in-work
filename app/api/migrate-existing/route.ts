import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get existing categories from the categories API
    const categoriesResponse = await fetch(`${request.nextUrl.origin}/api/categories`)
    const categoriesData = await categoriesResponse.json()
    
    // Get existing cities from the cities API
    const citiesResponse = await fetch(`${request.nextUrl.origin}/api/cities`)
    const citiesData = await citiesResponse.json()
    
    const migratedItems = []
    
    // Migrate categories
    if (categoriesData.categories) {
      for (const category of categoriesData.categories) {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'category',
              name: category.name,
              description: `Admin created category: ${category.name}`,
              image: category.image,
              created_by: 'admin',
              created_by_name: 'Admin'
            })
          })
          
          if (response.ok) {
            migratedItems.push({ type: 'category', name: category.name, status: 'migrated' })
          }
        } catch (error) {
          console.error(`Failed to migrate category ${category.name}:`, error)
          migratedItems.push({ type: 'category', name: category.name, status: 'failed' })
        }
      }
    }
    
    // Migrate cities
    if (citiesData.cities) {
      for (const city of citiesData.cities) {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'city',
              name: city.name,
              state: city.state || '',
              country: city.country || 'USA',
              created_by: 'admin',
              created_by_name: 'Admin'
            })
          })
          
          if (response.ok) {
            migratedItems.push({ type: 'city', name: city.name, status: 'migrated' })
          }
        } catch (error) {
          console.error(`Failed to migrate city ${city.name}:`, error)
          migratedItems.push({ type: 'city', name: city.name, status: 'failed' })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      migrated: migratedItems
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed'
    }, { status: 500 })
  }
}