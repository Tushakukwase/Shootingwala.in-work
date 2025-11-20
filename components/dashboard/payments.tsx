"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, CreditCard, Wallet, Download } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function PaymentHistorySection() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return
      
      try {
        // In a real app, this would fetch payment history for the specific user
        // For now, we'll use mock data but simulate an API call
        setLoading(true)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - in a real app, this would come from API
        const mockPayments = [
          {
            id: "TXN-001",
            date: "2023-06-15",
            amount: "₹12,500",
            method: "Credit Card",
            status: "Completed"
          },
          {
            id: "TXN-002",
            date: "2023-06-10",
            amount: "₹8,200",
            method: "UPI",
            status: "Completed"
          },
          {
            id: "TXN-003",
            date: "2023-06-05",
            amount: "₹15,000",
            method: "Net Banking",
            status: "Completed"
          },
          {
            id: "TXN-004",
            date: "2023-05-28",
            amount: "₹6,750",
            method: "Wallet",
            status: "Refunded"
          }
        ]
        
        setPayments(mockPayments)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        // Fallback to mock data on error
        setPayments([
          {
            id: "TXN-001",
            date: "2023-06-15",
            amount: "₹1,000",
            method: "Credit Card",
            status: "Completed"
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPayments()
  }, [user])

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card":
        return <CreditCard className="h-4 w-4" />
      case "Wallet":
        return <Wallet className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge>{status}</Badge>
      case "Refunded":
        return <Badge variant="secondary">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="font-medium">{payment.id}</div>
                <div>{payment.date}</div>
                <div className="flex items-center gap-2">
                  {getMethodIcon(payment.method)}
                  <span>{payment.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="font-semibold">{payment.amount}</span>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}