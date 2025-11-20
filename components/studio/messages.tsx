"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MessageCircle, User, Mail, Phone, Clock, Plus, Shield, ChevronDown, RefreshCw } from "lucide-react"

interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderName: string
  senderType: string
  recipientId: string
  recipientName: string
  recipientType: string
  message: string
  read: boolean
  createdAt: string
}

interface Conversation {
  _id: string
  userId: string
  userName: string
  userType: string
  participantId: string
  participantName: string
  participantType: string
  subject: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  createdAt: string
}

export default function StudioMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [newMessageSubject, setNewMessageSubject] = useState("")
  const [studioData, setStudioData] = useState<any>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get studio data from localStorage
    const data = localStorage.getItem('studio')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setStudioData(parsed)
        fetchConversations(parsed._id)
        
        // Set up polling for real-time updates with longer interval
        const interval = setInterval(() => {
          fetchConversations(parsed._id)
        }, 10000) // Poll every 10 seconds instead of 3
        
        return () => clearInterval(interval)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedConversation && studioData) {
      fetchMessages(selectedConversation._id)
      markAsRead(selectedConversation._id)
    }
  }, [selectedConversation, studioData])

  // Auto-refresh messages in selected conversation with longer interval
  useEffect(() => {
    if (selectedConversation && studioData) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id)
      }, 8000) // Refresh messages every 8 seconds instead of 2
      
      return () => clearInterval(interval)
    }
  }, [selectedConversation, studioData])

  // Remove automatic scrolling on message updates
  // Only scroll when explicitly needed (after sending)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }

  // Memoize the messages list to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => 
    messages.map((message) => (
      <div
        key={message._id}
        className={`flex ${message.senderType === 'photographer' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.senderType === 'photographer'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          <p className={`text-xs mt-1 ${
            message.senderType === 'photographer' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(message.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    )), [messages]
  )

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
    setShowScrollButton(!isNearBottom && messages.length > 5)
  }

  const fetchConversations = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        const newConversations = data.conversations || []
        // Only update if conversations have actually changed
        if (JSON.stringify(newConversations) !== JSON.stringify(conversations)) {
          setConversations(newConversations)
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      
      if (data.success) {
        const newMessages = data.messages || []
        // Only update if messages have actually changed
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const markAsRead = async (conversationId: string) => {
    if (!studioData) return
    
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: studioData._id
        })
      })
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !studioData || sending) return
    
    try {
      setSending(true)
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: studioData._id,
          senderName: studioData.name || studioData.photographerName || 'Photographer',
          senderType: 'photographer',
          recipientId: selectedConversation ? selectedConversation.participantId : 'admin',
          recipientName: selectedConversation ? selectedConversation.participantName : 'Admin',
          recipientType: selectedConversation ? selectedConversation.participantType : 'admin',
          message: newMessage,
          conversationId: selectedConversation?._id,
          subject: newMessageSubject || 'General Inquiry'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewMessage("")
        setNewMessageSubject("")
        setShowNewMessage(false)
        
        if (selectedConversation) {
          await fetchMessages(selectedConversation._id)
        } else {
          // New conversation created, refresh list and select it
          await fetchConversations(studioData._id)
        }
        await fetchConversations(studioData._id) // Refresh conversations to update last message
        
        // Scroll to bottom only after sending message
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const startNewConversation = () => {
    setSelectedConversation(null)
    setMessages([])
    setShowNewMessage(true)
    setNewMessage("")
    setNewMessageSubject("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Communicate with admin and support team</p>
        </div>
        <Button onClick={startNewConversation}>
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversations ({conversations.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => studioData && fetchConversations(studioData._id)}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs text-gray-400">Start a new conversation with admin</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation)
                      setShowNewMessage(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{conversation.participantName}</h4>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs font-medium text-gray-600 mb-1">{conversation.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(conversation.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation || showNewMessage ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation ? selectedConversation.participantName : 'New Message to Admin'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation ? selectedConversation.subject : 'Start a new conversation'}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
                onScroll={handleScroll}
              >
                {showNewMessage && !selectedConversation && (
                  <div className="mb-4">
                    <Input
                      placeholder="Subject (e.g., Booking Inquiry, Technical Support)"
                      value={newMessageSubject}
                      onChange={(e) => setNewMessageSubject(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                )}
                
                {memoizedMessages}
                <div ref={messagesEndRef} />
                
                {/* Scroll to bottom button */}
                {showScrollButton && (
                  <Button
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
                    size="sm"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending || (showNewMessage && !newMessageSubject.trim())}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {showNewMessage && (
                  <p className="text-xs text-gray-500 mt-2">
                    Please enter a subject and message to start a new conversation with admin
                  </p>
                )}
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No conversation selected</h3>
                <p className="text-gray-500 mb-4">Choose a conversation or start a new one</p>
                <Button onClick={startNewConversation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}