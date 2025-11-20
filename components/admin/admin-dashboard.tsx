"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Camera,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Plus,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Demo data
const monthlyUserGrowth = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1900 },
  { month: "Mar", users: 2400 },
  { month: "Apr", users: 2800 },
  { month: "May", users: 3200 },
  { month: "Jun", users: 3800 },
];

const userTypeData = [
  { name: "New Users", value: 3200, color: "#3b82f6" },
  { name: "Returning Users", value: 4800, color: "#10b981" },
];


const cityDistribution = [
  { city: "Mumbai", users: 1200 },
  { city: "Delhi", users: 980 },
  { city: "Bangalore", users: 850 },
  { city: "Pune", users: 720 },
  { city: "Hyderabad", users: 650 },
];

const monthlyBookings = [
  { month: "Jan", bookings: 45 },
  { month: "Feb", bookings: 62 },
  { month: "Mar", bookings: 78 },
  { month: "Apr", bookings: 95 },
  { month: "May", bookings: 112 },
  { month: "Jun", bookings: 128 },
];

const categoryBookings = [
  { category: "Wedding", bookings: 145, color: "#ef4444" },
  { category: "Pre-Wedding", bookings: 98, color: "#f59e0b" },
  { category: "Birthday", bookings: 76, color: "#8b5cf6" },
  { category: "Maternity", bookings: 54, color: "#ec4899" },
  { category: "Corporate", bookings: 42, color: "#06b6d4" },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 125000 },
  { month: "Feb", revenue: 158000 },
  { month: "Mar", revenue: 192000 },
  { month: "Apr", revenue: 215000 },
  { month: "May", revenue: 248000 },
  { month: "Jun", revenue: 285000 },
];

const topPhotographers = [
  { name: "Rajesh Kumar", bookings: 45, rating: 4.9 },
  { name: "Priya Sharma", bookings: 38, rating: 4.8 },
  { name: "Amit Patel", bookings: 35, rating: 4.7 },
  { name: "Sneha Reddy", bookings: 32, rating: 4.9 },
  { name: "Vikram Singh", bookings: 28, rating: 4.6 },
];

const latestUsers = [
  { name: "Ananya Gupta", email: "ananya@example.com", date: "2 hours ago" },
  { name: "Rohan Mehta", email: "rohan@example.com", date: "5 hours ago" },
  { name: "Kavya Iyer", email: "kavya@example.com", date: "1 day ago" },
];

const latestBookings = [
  { id: "BK001", customer: "Arjun Kapoor", photographer: "Rajesh Kumar", category: "Wedding", status: "confirmed", amount: 45000 },
  { id: "BK002", customer: "Meera Shah", photographer: "Priya Sharma", category: "Pre-Wedding", status: "pending", amount: 28000 },
  { id: "BK003", customer: "Karan Verma", photographer: "Amit Patel", category: "Birthday", status: "completed", amount: 15000 },
];


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 8000,
    newUsersToday: 45,
    newUsersWeekly: 312,
    newUsersMonthly: 1240,
    returningUsers: 4800,
    dailyActiveUsers: 1850,
    monthlyActiveUsers: 6200,
    totalPhotographers: 245,
    totalBookings: 1580,
    pendingBookings: 38,
    totalRevenue: 1223000,
    payoutsPending: 185000,
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Photographer
          </Button>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-500"
          trend="+12.5%"
        />
        <StatCard
          title="New Users (Today)"
          value={stats.newUsersToday}
          icon={<UserPlus className="w-5 h-5" />}
          color="bg-green-500"
          trend="+8.2%"
        />
        <StatCard
          title="Total Photographers"
          value={stats.totalPhotographers}
          icon={<Camera className="w-5 h-5" />}
          color="bg-purple-500"
          trend="+5.4%"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={<Calendar className="w-5 h-5" />}
          color="bg-orange-500"
          trend="+15.3%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Active Users"
          value={stats.dailyActiveUsers.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="bg-cyan-500"
        />
        <StatCard
          title="Monthly Active Users"
          value={stats.monthlyActiveUsers.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={<Clock className="w-5 h-5" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-500"
          trend="+18.7%"
        />
      </div>


      {/* Alerts & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AlertCard
          type="warning"
          title="Photographer Verifications"
          message="12 photographers pending verification"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <AlertCard
          type="error"
          title="Payment Failures"
          message="5 payment failures need attention"
          icon={<XCircle className="w-5 h-5" />}
        />
        <AlertCard
          type="info"
          title="High Cancellations"
          message="3 photographers with high cancellation rate"
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* User Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New vs Returning Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              New vs Returning Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Monthly User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* City Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            City-wise User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      {/* Photographer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Photographers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top 5 Most Booked Photographers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPhotographers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Rated Photographers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top Rated Photographers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPhotographers.map((photographer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {photographer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{photographer.name}</p>
                      <p className="text-sm text-gray-600">{photographer.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{photographer.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Monthly Bookings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#f97316" fill="#fb923c" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category-wise Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Category-wise Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBookings}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, bookings }) => `${category}: ${bookings}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="bookings"
                >
                  {categoryBookings.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Booking Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Bookings</p>
                <p className="text-3xl font-bold text-green-600">1,245</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
                <p className="text-3xl font-bold text-yellow-600">38</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cancelled Bookings</p>
                <p className="text-3xl font-bold text-red-600">297</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Finance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#34d399" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Status & Commission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payments Received</p>
                <p className="text-2xl font-bold text-blue-600">₹10.38L</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Payments Pending</p>
                <p className="text-2xl font-bold text-yellow-600">₹1.85L</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commission Earned</p>
                <p className="text-2xl font-bold text-purple-600">₹2.45L</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Latest Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest User Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Latest User Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{user.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Payout Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPhotographers.slice(0, 3).map((photographer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                      {photographer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{photographer.name}</p>
                      <p className="text-sm text-gray-600">₹{(photographer.bookings * 1200).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Process
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Latest Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Booking ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Photographer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestBookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                    <td className="py-3 px-4">{booking.customer}</td>
                    <td className="py-3 px-4">{booking.photographer}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{booking.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold">₹{booking.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>


      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex-col gap-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Add Photographer</span>
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-sm">Add Category</span>
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 h-auto py-4 flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <span className="text-sm">Add City</span>
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 h-auto py-4 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Manage Bookings</span>
            </Button>
            <Button className="bg-pink-600 hover:bg-pink-700 h-auto py-4 flex-col gap-2">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Manage Payouts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Card Component
function AlertCard({
  type,
  title,
  message,
  icon,
}: {
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  icon: React.ReactNode;
}) {
  const colors = {
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <Card className={`${colors[type]} border-2`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
