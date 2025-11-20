"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send, 
  MessageCircle, 
  User, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  RefreshCw,
  Camera,
  Users
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  type: 'photographer' | 'client'
  avatar?: string
  location?: string
  status: 'active' | 'inactive'
  lastActive?: string
}

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

export default function EnhancedMessagingView() {
  const [photographers, setPhotographers] = useState<User[]>([])
  const [clients, setClients] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<'photographers' | 'clients' | 'conversations'>('photographers')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUsers()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id)
      markAsRead(selectedConversation._id)
    }
  }, [selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch photographers
      const photographersResponse = await fetch('/api/photographers')
      const photographersData = await photographersResponse.json()
      
      const transformedPhotographers = (photographersData.photographers || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        type: 'photographer' as const,
        avatar: p.image,
        location: p.location,
        status: p.approved ? 'active' : 'inactive',
        lastActive: p.lastActive
      }))
      
      setPhotographers(transformedPhotographers)
      
      // Fetch clients/users
      const clientsResponse = await fetch('/api/admin/users')
      const clientsData = await clientsResponse.json()
      
      const transformedClients = (clientsData.users || []).map((u: any) => ({
        id: u._id,
        name: u.fullName || u.name,
        email: u.email,
        phone: u.phone,
        type: 'client' as const,
        avatar: u.image,
        location: u.location,
        status: u.status === 'active' ? 'active' : 'inactive',
        lastActive: u.lastLogin
      }))
      
      setClients(transformedClients)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages?isAdmin=true')
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
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

  const startConversation = async (user: User) => {
    try {
      setSelectedUser(user)
      
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.userId === user.id || conv.participantId === user.id
      )
      
      if (existingConversation) {
        setSelectedConversation(existingConversation)
        return
      }
      
      // Create new conversation by sending a message to the user
      // The POST endpoint will automatically create a conversation if one doesn't exist
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'admin',
          senderName: 'Admin',
          senderType: 'admin',
          recipientId: user.id,
          recipientName: user.name,
          recipientType: user.type,
          message: 'Hello, how can I help you today?',
          subject: `Message from Admin`
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // After creating the conversation, fetch the updated conversations list
        fetchConversations()
        
        // Find the newly created conversation
        setTimeout(async () => {
          await fetchConversations()
          const updatedConversations = await fetch('/api/messages?isAdmin=true')
          const updatedData = await updatedConversations.json()
          if (updatedData.success) {
            const newConversation = updatedData.conversations.find((conv: any) => 
              conv.userId === user.id || conv.participantId === user.id
            )
            if (newConversation) {
              setSelectedConversation(newConversation)
            }
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
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
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (photographer.location && photographer.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || photographer.status === filter
    
    return matchesSearch && matchesFilter
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.location && client.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' || client.status === filter
    
    return matchesSearch && matchesFilter
  })

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Users List */}
      <div className="w-1/3 border-r border-border">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messaging
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchUsers}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
            
            {/* Tabs */}
            <div className="flex gap-1 mt-2">
              <Button
                variant={activeTab === 'photographers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('photographers')}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-1" />
                Photographers
              </Button>
              <Button
                variant={activeTab === 'clients' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('clients')}
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-1" />
                Clients
              </Button>
              <Button
                variant={activeTab === 'conversations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('conversations')}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Conversations
              </Button>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeTab !== 'conversations' && (
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
                    variant={filter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('active')}
                    className="flex-1"
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === 'inactive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('inactive')}
                    className="flex-1"
                  >
                    Inactive
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {activeTab === 'photographers' && (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredPhotographers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No photographers found</p>
                  </div>
                ) : (
                  filteredPhotographers.map((photographer) => (
                    <div
                      key={photographer.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                        selectedUser?.id === photographer.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => startConversation(photographer)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={photographer.avatar} />
                          <AvatarFallback className="bg-gray-200">
                            {photographer.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{photographer.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                photographer.status === 'active' 
                                  ? 'bg-green-50 text-green-700' 
                                  : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {photographer.status}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500 truncate">{photographer.email}</p>
                          
                          {photographer.location && (
                            <p className="text-xs text-gray-400 mt-1">{photographer.location}</p>
                          )}
                          
                          {photographer.phone && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <Phone className="w-3 h-3" />
                              {photographer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'clients' && (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No clients found</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                        selectedUser?.id === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => startConversation(client)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-gray-200">
                            {client.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{client.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                client.status === 'active' 
                                  ? 'bg-green-50 text-green-700' 
                                  : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {client.status}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500 truncate">{client.email}</p>
                          
                          {client.location && (
                            <p className="text-xs text-gray-400 mt-1">{client.location}</p>
                          )}
                          
                          {client.phone && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'conversations' && (
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
                            <h4 className="font-medium text-sm truncate">{conversation.userName}</h4>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className="text-xs mb-1"
                          >
                            {conversation.userType}
                          </Badge>
                          
                          <p className="text-xs font-medium text-gray-600 mb-1">{conversation.subject}</p>
                          <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            {new Date(conversation.lastMessageAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
                    <Badge variant="outline" className="text-xs">
                      {selectedConversation.userType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
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
              ))}
              <div ref={messagesEndRef} />
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
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {selectedUser 
                  ? `Start messaging ${selectedUser.name}` 
                  : "Select a user or conversation"}
              </h3>
              <p className="text-gray-500">
                {selectedUser 
                  ? "Type a message below to start the conversation" 
                  : "Choose a user from the list to start messaging"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}