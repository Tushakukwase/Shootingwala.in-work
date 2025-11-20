"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

export function EarningsChart() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    { month: "Aug", earnings: 1200 },
    { month: "Sep", earnings: 1900 },
    { month: "Oct", earnings: 1600 },
    { month: "Nov", earnings: 2100 },
    { month: "Dec", earnings: 2450 },
  ]

  const maxEarnings = Math.max(...data.map(d => d.earnings))
  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0)
  const avgEarnings = Math.round(totalEarnings / data.length)

  if (!mounted) {
    return (
      <Card className="bg-white">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle>Earnings Summary</CardTitle>
            <Button variant="outline" size="sm">View Payment History</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Earnings Summary</CardTitle>
          <Button variant="outline" size="sm">View Payment History</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">${totalEarnings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">${avgEarnings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">${maxEarnings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Best Month</div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Monthly Earnings</h4>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-muted-foreground">
                  {item.month}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(item.earnings / maxEarnings) * 100}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">
                      ${item.earnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Indicator */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Growth from last month</span>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+16.7%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}