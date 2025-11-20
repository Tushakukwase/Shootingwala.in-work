import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'tusharkukwase24@gmail.com';
    
    // Verify if the email matches the authorized admin email
    const isAuthorizedAdmin = email === adminEmail;
    
    return NextResponse.json({ 
      success: true,
      isAuthorizedAdmin,
      message: isAuthorizedAdmin ? 'Admin access granted' : 'Admin access denied'
    });
    
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Verification failed' 
    }, { status: 500 });
  }
}