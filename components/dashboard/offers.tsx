import { Card } from "@/components/ui/card"

export function Offers() {
  return (
    <section aria-labelledby="offers" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="offers" className="text-xl font-bold text-black">
          🎉 Offers & Promotions
        </h2>
        <span className="text-sm text-gray-500 font-medium">Limited Time</span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-black border-2 border-yellow-600">
          <p className="text-sm font-bold">🌸 Spring Special</p>
          <p className="text-2xl font-bold mt-1">15% off weddings</p>
          <p className="text-sm font-semibold mt-1 opacity-80">Limited time offer</p>
        </Card>
        
        <Card className="p-5 rounded-xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 transition-colors">
          <p className="text-sm font-bold text-black">🏢 New Studio</p>
          <p className="text-2xl font-bold mt-1 text-black">Free 30 min add-on</p>
          <p className="text-sm text-gray-600 font-medium mt-1">For first booking</p>
        </Card>
        
        <Card className="p-5 rounded-xl border-2 border-yellow-200 bg-white hover:bg-yellow-50 transition-colors">
          <p className="text-sm font-bold text-black">👥 Referral</p>
          <p className="text-2xl font-bold mt-1 text-black">Get $25 credit</p>
          <p className="text-sm text-gray-600 font-medium mt-1">Invite a friend</p>
        </Card>
      </div>
    </section>
  )
}