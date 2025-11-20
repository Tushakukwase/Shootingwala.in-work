"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MessageCircle, User, Mail, Phone, Clock, Search, Filter, ChevronDown, RefreshCw } from "lucide-react"

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
  userEmail?: string
  userPhone?: string
  userType: string
  participantId: string
  participantName: string
  participantType: string
  subject: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isContactForm?: boolean
  createdAt: string
}

export default function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<'all' | 'photographers' | 'contact'>('all')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
    
    // Set up polling for real-time updates with longer interval
    const interval = setInterval(() => {
      fetchConversations()
    }, 10000) // Poll every 10 seconds instead of 3
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
      markAsRead(selectedConversation._id)
    }
  }, [selectedConversation])

  // Auto-refresh messages in selected conversation with longer interval
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation._id)
      }, 8000) // Refresh messages every 8 seconds instead of 2
      
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

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
        className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            message.senderType === 'admin'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          <p className={`text-xs mt-1 ${
            message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500'
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

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages?isAdmin=true')
      const data = await response.json()
      
      if (data.success) {
        const newConversations = data.conversations || []
        // Only update if conversations have actually changed
        if (JSON.stringify(newConversations) !== JSON.stringify(conversations)) {
          setConversations(newConversations)
          setLastUpdate(Date.now())
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
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: 'admin'
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
    if (!newMessage.trim() || !selectedConversation || sending) return
    
    try {
      setSending(true)
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'admin',
          senderName: 'Admin',
          senderType: 'admin',
          recipientId: selectedConversation.userId,
          recipientName: selectedConversation.userName,
          recipientType: selectedConversation.userType,
          message: newMessage,
          conversationId: selectedConversation._id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewMessage("")
        // Refresh both messages and conversations
        await fetchMessages(selectedConversation._id)
        await fetchConversations()
        
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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'photographers' && conv.userType === 'photographer') ||
                         (filter === 'contact' && conv.isContactForm)
    
    return matchesSearch && matchesFilter
  })

  const getConversationIcon = (conversation: Conversation) => {
    if (conversation.isContactForm) {
      return <Mail className="w-4 h-4 text-blue-500" />
    }
    return <User className="w-4 h-4 text-green-500" />
  }

  const getConversationBadge = (conversation: Conversation) => {
    if (conversation.isContactForm) {
      return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Contact Form</Badge>
    }
    return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Photographer</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages ({conversations.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchConversations()}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'photographers' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('photographers')}
                  className="flex-1"
                >
                  Photographers
                </Button>
                <Button
                  variant={filter === 'contact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('contact')}
                  className="flex-1"
                >
                  Contact
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200">
                          {conversation.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getConversationIcon(conversation)}
                            <h4 className="font-medium text-sm truncate">{conversation.userName}</h4>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          {getConversationBadge(conversation)}
                        </div>
                        
                        <p className="text-xs font-medium text-gray-600 mb-1">{conversation.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(conversation.lastMessageAt).toLocaleString()}
                        </div>
                        
                        {conversation.userEmail && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            {conversation.userEmail}
                          </div>
                        )}
                        
                        {conversation.userPhone && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3" />
                            {conversation.userPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <Card className="rounded-none border-0 border-b">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-200">
                      {selectedConversation.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.userName}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                    {getConversationBadge(selectedConversation)}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 relative"
              onScroll={handleScroll}
            >
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
            </div>

            {/* Message Input */}
            <Card className="rounded-none border-0 border-t">
              <CardContent className="p-4">
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
                    disabled={!newMessage.trim() || sending}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}