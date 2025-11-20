import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, contact, otp } = await request.json()
    
    if (!type || !contact || !otp) {
      return NextResponse.json(
        { success: false, error: 'Type, contact, and OTP are required' },
        { status: 400 }
      )
    }
    
    // In a real application, you would:
    // 1. Retrieve the stored OTP from database
    // 2. Check if it matches and hasn't expired
    // 3. Mark the contact as verified
    
    // For demo purposes, we'll accept "123456" as valid OTP
    const validOtp = "123456"
    
    if (otp !== validOtp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      )
    }
    
    console.log(`OTP verified for ${type}: ${contact}`)
    
    return NextResponse.json({
      success: true,
      message: `${type} verified successfully`,
      verified: true
    })
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}