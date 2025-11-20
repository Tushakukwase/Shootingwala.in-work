import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value
    const userCookie = req.cookies.get('user')?.value
    
    let userData = null
    if (userCookie) {
      try {
        userData = JSON.parse(decodeURIComponent(userCookie))
      } catch (e) {
        userData = { error: 'Failed to parse user cookie' }
      }
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        hasToken: !!token,
        token: token ? token.substring(0, 20) + '...' : null,
        hasUserCookie: !!userCookie,
        userData: userData,
        adminEmail: process.env.ADMIN_EMAIL || 'tusharkukwase24@gmail.com'
      }
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Debug failed',
      details: error 
    }, { status: 500 });
  }
}