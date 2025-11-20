import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, contact } = await request.json()
    
    if (!type || !contact) {
      return NextResponse.json(
        { success: false, error: 'Type and contact are required' },
        { status: 400 }
      )
    }
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // In a real application, you would:
    // 1. Store the OTP in database with expiration time
    // 2. Send actual SMS/Email using services like Twilio, SendGrid, etc.
    
    console.log(`Sending OTP ${otp} to ${type}: ${contact}`)
    
    // For demo purposes, we'll just return success
    // In production, integrate with actual SMS/Email services
    
    if (type === 'email') {
      // Send email OTP using your email service
      console.log(`Email OTP sent to: ${contact}`)
    } else if (type === 'mobile') {
      // Send SMS OTP using your SMS service
      console.log(`SMS OTP sent to: ${contact}`)
    }
    
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${type}`,
      // In production, don't return the OTP
      otp: otp // Only for demo purposes
    })
    
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}