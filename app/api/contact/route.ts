import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()
    
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and message are required'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('photobook')
    const conversations = db.collection('conversations')
    const messages = db.collection('messages')
    
    // Create conversation for contact form submission
    const newConversation = {
      userId: 'contact-' + Date.now(),
      userName: name,
      userEmail: email,
      userPhone: phone || '',
      userType: 'contact',
      participantId: 'admin',
      participantName: 'Admin',
      participantType: 'admin',
      subject: subject || 'Contact Form Inquiry',
      lastMessage: message,
      lastMessageAt: new Date(),
      unreadCount: 1,
      isContactForm: true,
      createdAt: new Date()
    }
    
    const conversationResult = await conversations.insertOne(newConversation)
    const conversationId = conversationResult.insertedId.toString()
    
    // Create initial message
    const newMessage = {
      conversationId,
      senderId: 'contact-' + Date.now(),
      senderName: name,
      senderType: 'contact',
      recipientId: 'admin',
      recipientName: 'Admin',
      recipientType: 'admin',
      message: `Contact Form Submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject || 'General Inquiry'}\n\nMessage:\n${message}`,
      read: false,
      createdAt: new Date()
    }
    
    await messages.insertOne(newMessage)
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    })
    
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit contact form'
    }, { status: 500 })
  }
}