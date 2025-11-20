"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Calendar, CreditCard, Clock, Eye, Download } from "lucide-react"

interface EarningsData {
  totalEarnings: number
  pendingPayments: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  completedBookings: number
  pendingBookings: number
  averageBookingValue: number
  monthlyBreakdown: { month: string; earnings: number }[]
  recentTransactions: {
    id: string
    clientName: string
    eventName: string
    amount: number
    status: 'paid' | 'pending' | 'overdue'
    date: string
  }[]
}

export default function EarningSummary() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')
  const [photographerId, setPhotographerId] = useState<string>('')

  useEffect(() => {
    // Get photographer ID from localStorage
    const studioData = localStorage.getItem('studio')
    if (studioData) {
      try {
        const parsed = JSON.parse(studioData)
        setPhotographerId(parsed._id)
        loadEarningsData(parsed._id)
      } catch (error) {
        console.error('Error parsing studio data:', error)
      }
    }
  }, [])

  const loadEarningsData = async (photographerId: string) => {
    try {
      setLoading(true)
      
      // Load bookings to calculate earnings
      const bookingsResponse = await fetch(`/api/bookings?photographerId=${photographerId}`)
      const bookingsData = await bookingsResponse.json()
      
      if (bookingsData.success) {
        const bookings = bookingsData.data
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
        
        // Calculate earnings
        const totalEarnings = bookings.reduce((sum: number, booking: any) => sum + booking.paidAmount, 0)
        const pendingPayments = bookings.reduce((sum: number, booking: any) => sum + (booking.totalAmount - booking.paidAmount), 0)
        
        const thisMonthBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.date)
          return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear
        })
        const thisMonthEarnings = thisMonthBookings.reduce((sum: number, booking: any) => sum + booking.paidAmount, 0)
        
        const lastMonthBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.date)
          return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear
        })
        const lastMonthEarnings = lastMonthBookings.reduce((sum: number, booking: any) => sum + booking.paidAmount, 0)
        
        const completedBookings = bookings.filter((booking: any) => booking.status === 'completed').length
        const pendingBookings = bookings.filter((booking: any) => booking.status === 'pending').length
        const averageBookingValue = bookings.length > 0 ? totalEarnings / bookings.length : 0
        
        // Generate monthly breakdown for the last 6 months
        const monthlyBreakdown = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date(thisYear, thisMonth - i, 1)
          const monthBookings = bookings.filter((booking: any) => {
            const bookingDate = new Date(booking.date)
            return bookingDate.getMonth() === date.getMonth() && bookingDate.getFullYear() === date.getFullYear()
          })
          const monthEarnings = monthBookings.reduce((sum: number, booking: any) => sum + booking.paidAmount, 0)
          
          monthlyBreakdown.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            earnings: monthEarnings
          })
        }
        
        // Recent transactions (last 10 bookings)
        const recentTransactions = bookings
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map((booking: any) => ({
            id: booking.id,
            clientName: booking.clientName,
            eventName: booking.eventName,
            amount: booking.paidAmount,
            status: booking.paidAmount >= booking.totalAmount ? 'paid' : 
                   booking.paidAmount > 0 ? 'pending' : 'overdue',
            date: booking.date
          }))
        
        setEarningsData({
          totalEarnings,
          pendingPayments,
          thisMonthEarnings,
          lastMonthEarnings,
          completedBookings,
          pendingBookings,
          averageBookingValue,
          monthlyBreakdown,
          recentTransactions
        })
      }
    } catch (error) {
      console.error('Error loading earnings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrowthPercentage = () => {
    if (!earningsData || earningsData.lastMonthEarnings === 0) return 0
    return ((earningsData.thisMonthEarnings - earningsData.lastMonthEarnings) / earningsData.lastMonthEarnings) * 100
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    )
  }

  if (!earningsData) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No earnings data available</h3>
          <p className="text-muted-foreground">Complete some bookings to see your earnings summary</p>
        </div>
      </div>
    )
  }

  const growthPercentage = getGrowthPercentage()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Earnings Summary</h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${earningsData.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${earningsData.thisMonthEarnings.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className={`w-3 h-3 ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">${earningsData.pendingPayments.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Booking Value</p>
                <p className="text-2xl font-bold">${earningsData.averageBookingValue.toFixed(0)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Bookings</p>
                <p className="text-2xl font-bold">{earningsData.completedBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Bookings</p>
                <p className="text-2xl font-bold">{earningsData.pendingBookings}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{earningsData.completedBookings + earningsData.pendingBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningsData.monthlyBreakdown.map((month, index) => {
              const maxEarnings = Math.max(...earningsData.monthlyBreakdown.map(m => m.earnings))
              const percentage = maxEarnings > 0 ? (month.earnings / maxEarnings) * 100 : 0
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{month.month}</div>
                  <div className="flex-1 bg-muted rounded-full h-6 relative">
                    <div
                      className="bg-primary h-6 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {month.earnings > 0 && (
                        <span className="text-xs text-primary-foreground font-medium">
                          ${month.earnings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {earningsData.recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earningsData.recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{transaction.eventName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.clientName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${transaction.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transaction.status)}
                      <span className="text-xs text-muted-foreground">{transaction.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}