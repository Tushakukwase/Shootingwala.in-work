"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { X, ShoppingCart as CartIcon } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wedding Photography",
      description: "Full day wedding photography coverage",
      duration: "8 hours",
      price: 4999,
      quantity: 1,
      image: null as string | null
    },
    {
      id: 2,
      name: "Pre-Wedding Shoot",
      description: "Outdoor pre-wedding photoshoot",
      duration: "2 hours",
      price: 2499,
      quantity: 1,
      image: null as string | null
    }
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    // In a real application, this would redirect to a checkout page
    alert("Proceeding to checkout!")
    // router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <Link href="/" className="text-sm text-gray-500 hover:text-orange-500">
              Continue Shopping
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <CartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Start adding some services to your cart</p>
              <div className="mt-6">
                <Button onClick={() => router.push('/')} variant="default">
                  Browse Services
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center border-b border-gray-200 pb-6">
                    {/* Item Image Placeholder */}
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      )}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                          <p className="mt-1 text-sm text-gray-500">{item.duration}</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">₹{item.price}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-t border-b border-gray-300 text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-gray-900">₹99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900">₹{Math.round(getTotalPrice() * 0.18)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{getTotalPrice() + 99 + Math.round(getTotalPrice() * 0.18)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}