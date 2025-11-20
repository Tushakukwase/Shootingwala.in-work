"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Calendar,
  IndianRupee,
  Download,
  Eye,
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function OrdersSection() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock data - in a real app, this would come from API
  const mockOrders = [
    {
      id: "ORD-001",
      title: "Wedding Photography Package",
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
      date: "2023-06-15",
      amount: "₹12,500",
      paymentMethod: "Credit Card",
      status: "Delivered",
      items: [
        {
          id: "1",
          name: "Premium Wedding Photography",
          price: "₹10,000",
          quantity: 1,
          image: "/placeholder.svg?height=100&width=100"
        },
        {
          id: "2",
          name: "Candid Photoshoot",
          price: "₹2,500",
          quantity: 1,
          image: "/placeholder.svg?height=100&width=100"
        }
      ],
      shippingAddress: "123 Main Street, Mumbai, Maharashtra 400001",
      tracking: [
        { status: "Ordered", date: "2023-06-15", completed: true },
        { status: "Packed", date: "2023-06-16", completed: true },
        { status: "Shipped", date: "2023-06-17", completed: true },
        { status: "Delivered", date: "2023-06-20", completed: true }
      ]
    },
    {
      id: "ORD-002",
      title: "Portrait Session",
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
      date: "2023-06-10",
      amount: "₹3,500",
      paymentMethod: "UPI",
      status: "Shipped",
      items: [
        {
          id: "3",
          name: "Professional Portrait Session",
          price: "₹3,500",
          quantity: 1,
          image: "/placeholder.svg?height=100&width=100"
        }
      ],
      shippingAddress: "123 Main Street, Mumbai, Maharashtra 400001",
      tracking: [
        { status: "Ordered", date: "2023-06-10", completed: true },
        { status: "Packed", date: "2023-06-11", completed: true },
        { status: "Shipped", date: "2023-06-12", completed: true },
        { status: "Delivered", date: "", completed: false }
      ]
    },
    {
      id: "ORD-003",
      title: "Corporate Event Coverage",
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
      date: "2023-06-05",
      amount: "₹15,000",
      paymentMethod: "Net Banking",
      status: "Pending",
      items: [
        {
          id: "4",
          name: "Full Day Corporate Event Coverage",
          price: "₹15,000",
          quantity: 1,
          image: "/placeholder.svg?height=100&width=100"
        }
      ],
      shippingAddress: "123 Main Street, Mumbai, Maharashtra 400001",
      tracking: [
        { status: "Ordered", date: "2023-06-05", completed: true },
        { status: "Packed", date: "", completed: false },
        { status: "Shipped", date: "", completed: false },
        { status: "Delivered", date: "", completed: false }
      ]
    },
    {
      id: "BKG-001",
      title: "Rifle Shooting Session",
      image: "/placeholder.svg?height=100&width=100",
      quantity: 1,
      date: "2023-06-25",
      amount: "₹2,000",
      paymentMethod: "Wallet",
      status: "Confirmed",
      type: "booking",
      event: "Rifle Shooting Range",
      time: "10:00 AM - 12:00 PM",
      bookingItems: [
        {
          id: "5",
          name: "Rifle Shooting Session",
          price: "₹2,000",
          quantity: 1,
          image: "/placeholder.svg?height=100&width=100"
        }
      ]
    }
  ]

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        // In a real app, this would fetch orders for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        setOrders(mockOrders)
        setFilteredOrders(mockOrders)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        // Fallback to mock data on error
        setOrders(mockOrders)
        setFilteredOrders(mockOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  useEffect(() => {
    let result = orders

    // Apply search filter
    if (searchTerm) {
      result = result.filter(order =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.date.includes(searchTerm)
      )
    }

    // Apply status filter
    if (filterStatus !== "All") {
      result = result.filter(order => order.status === filterStatus)
    }

    setFilteredOrders(result)
  }, [searchTerm, filterStatus, orders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{status}</Badge>
      case "Shipped":
        return <Badge className="bg-blue-100 text-blue-800"><Truck className="h-3 w-3 mr-1" />{status}</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />{status}</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) {
      return <div className="h-3 w-3 rounded-full bg-gray-300"></div>
    }

    switch (status) {
      case "Ordered":
        return <Package className="h-4 w-4 text-blue-500" />
      case "Packed":
        return <Package className="h-4 w-4 text-yellow-500" />
      case "Shipped":
        return <Truck className="h-4 w-4 text-purple-500" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-300"></div>
    }
  }

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders & Bookings</h1>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>
            <div className="w-32">
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders & Bookings</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet</p>
            <Button>Shop Now</Button>
          </CardContent>
        </Card>
      ) : (
        /* Orders List Section */
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={order.image}
                    alt={order.title}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <h3 className="font-medium">{order.title}</h3>
                    {order.type === "booking" ? (
                      <p className="text-sm text-gray-500">{order.event}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{order.date}</span>
                    {order.time && <span className="text-sm text-gray-500">{order.time}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.amount}</span>
                    <span className="text-sm text-gray-500">via {order.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(order.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewOrderDetails(order)}
                      className="ml-2"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-500">Order ID: {selectedOrder.id}</p>
                </div>
                <Button variant="ghost" onClick={closeModal}>✕</Button>
              </div>

              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.items || selectedOrder.bookingItems || []).map((item: any) => (
                      <div key={item.id} className="flex gap-4 p-3 border rounded-md">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex justify-between mt-2">
                            <span className="text-gray-500">Qty: {item.quantity}</span>
                            <span className="font-medium">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Date:</span>
                        <span>{selectedOrder.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method:</span>
                        <span>{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="font-medium">{selectedOrder.amount}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.shippingAddress && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                      <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                    </div>
                  )}
                </div>

                {/* Tracking Information */}
                {selectedOrder.tracking && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tracking Information</h3>
                    <div className="flex justify-between relative">
                      {/* Progress line */}
                      <div className="absolute top-3 left-3 right-3 h-0.5 bg-gray-200 z-0"></div>
                      
                      {selectedOrder.tracking.map((step: any, index: number) => (
                        <div key={index} className="flex flex-col items-center z-10">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center mb-2 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {getStatusIcon(step.status, step.completed)}
                          </div>
                          <span className="text-xs text-center">{step.status}</span>
                          {step.date && <span className="text-xs text-gray-500">{step.date}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button onClick={closeModal}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}