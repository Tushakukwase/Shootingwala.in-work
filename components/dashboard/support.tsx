"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Headphones, 
  Mail, 
  MessageCircle,
  Phone,
  Ticket
} from "lucide-react"

export function SupportSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Support Options */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Support Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start gap-3 h-14">
              <Ticket className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Raise a Ticket</div>
                <div className="text-xs text-muted-foreground">Get help with your issues</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-14">
              <Phone className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Call Support</div>
                <div className="text-xs text-muted-foreground">+91 98765 43210</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-14">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Email Support</div>
                <div className="text-xs text-muted-foreground">support@photobook.com</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-14">
              <MessageCircle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Live Chat</div>
                <div className="text-xs text-muted-foreground">Chat with our team</div>
              </div>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <h4 className="font-semibold">Order Issues</h4>
                <p className="text-muted-foreground">Trouble with your order? Contact us immediately.</p>
              </div>
              <div className="text-sm">
                <h4 className="font-semibold">Payment Problems</h4>
                <p className="text-muted-foreground">Having trouble with payments? We can help.</p>
              </div>
              <div className="text-sm">
                <h4 className="font-semibold">Account Help</h4>
                <p className="text-muted-foreground">Need help with your account? We're here for you.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Contact Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                <span>Contact Support</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter subject" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue in detail" 
                  className="min-h-[120px]"
                />
              </div>
              
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}