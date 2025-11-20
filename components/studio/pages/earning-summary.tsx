"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const earningsData = [
  { month: "Jan", earnings: 2400 },
  { month: "Feb", earnings: 1398 },
  { month: "Mar", earnings: 9800 },
  { month: "Apr", earnings: 3908 },
  { month: "May", earnings: 4800 },
  { month: "Jun", earnings: 3800 },
]

export default function EarningSummary() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Earning Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">$26,706</div>
            <p className="text-xs text-muted-foreground mt-2">Last 6 months</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average per Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent">$450</div>
            <p className="text-xs text-muted-foreground mt-2">Based on 59 bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  border: "1px solid var(--border)" 
                }} 
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base">
        Request Withdrawal
      </Button>
    </div>
  )
}