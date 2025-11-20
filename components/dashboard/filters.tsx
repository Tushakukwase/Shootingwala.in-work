"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function Filters() {
  const [type, setType] = useState("")
  const [city, setCity] = useState("")
  const [date, setDate] = useState("")
  const [price, setPrice] = useState("")

  return (
    <section aria-labelledby="filters" className="space-y-3">
      <h2 id="filters" className="text-lg font-bold text-black">
        🔍 Search & Filters
      </h2>
      <Card className="p-4 border-2 border-yellow-200 bg-yellow-50/30">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-black" htmlFor="type">
              Photography Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-md border-2 border-yellow-200 bg-white px-3 focus:border-yellow-400 focus:ring-yellow-400"
            >
              <option value="">Any</option>
              <option>Wedding</option>
              <option>Event</option>
              <option>Portrait</option>
              <option>Product</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-black" htmlFor="city">
              Location / City
            </label>
            <Input 
              id="city" 
              placeholder="e.g. Miami" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="border-2 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-black" htmlFor="date">
              Availability Date
            </label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-black" htmlFor="price">
              Max Price
            </label>
            <select
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10 rounded-md border-2 border-yellow-200 bg-white px-3 focus:border-yellow-400 focus:ring-yellow-400"
            >
              <option value="">Any</option>
              <option>$100</option>
              <option>$250</option>
              <option>$500</option>
              <option>$1000</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full rounded-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold">
              Apply Filters
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="font-semibold text-black">Sort by:</span>
          <button className="rounded-full px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-black font-medium transition">
            ⭐ Ratings
          </button>
          <button className="rounded-full px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-black font-medium transition">
            💰 Price
          </button>
          <button className="rounded-full px-4 py-2 bg-yellow-200 hover:bg-yellow-300 text-black font-medium transition">
            🎯 Experience
          </button>
        </div>
      </Card>
    </section>
  )
}