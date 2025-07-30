'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { 
  Users, 
  MapPin, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react'
import { Link } from '@/lib/Link'
import { Contact, contactService } from '@/lib/supabase'

interface Payment {
  id?: number
  personName: string
  phoneNumber: string
  district: string
  position: string
  amount: number
  paymentDate: string
  status: 'paid' | 'demanding' | 'pending'
  reason: string
  accomplished: boolean
  notes?: string
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Load sample data for demonstration
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load dummy contacts
      const dummyContacts: Contact[] = [
        {
          id: 1,
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+256701234567',
          region: 'Kampala',
          district: 'Kampala Central',
          position: 'Chairperson',
          role: 'Delegate',
          custom_role: '',
          experience: '5 years in community organizing',
          motivation: 'To support King Ceasor\'s vision for economic empowerment',
          kc: 'KC001',
          hb: 'HB001',
          kk: 'KK001',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          full_name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+256702345678',
          region: 'Greater Mukono Region',
          district: 'Mukono',
          position: 'General Secretary',
          role: 'Ground Agent',
          custom_role: '',
          experience: '3 years in youth mobilization',
          motivation: 'To contribute to the campaign\'s success and help build networks',
          kc: 'KC002',
          hb: 'HB002',
          kk: 'KK002',
          created_at: '2024-01-16T11:00:00Z',
          updated_at: '2024-01-16T11:00:00Z'
        },
        {
          id: 3,
          full_name: 'Michael Johnson',
          email: 'michael.johnson@example.com',
          phone: '+256703456789',
          region: 'Ankole Region',
          district: 'Mbarara District',
          position: 'Treasurer',
          role: 'Digital Influencer',
          custom_role: '',
          experience: 'Social media marketing and digital campaigns',
          motivation: 'To leverage digital platforms for campaign outreach',
          kc: 'KC003',
          hb: 'HB003',
          kk: 'KK003',
          created_at: '2024-01-17T12:00:00Z',
          updated_at: '2024-01-17T12:00:00Z'
        },
        {
          id: 4,
          full_name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+256704567890',
          region: 'West Nile Region',
          district: 'Arua',
          position: 'Coordinator',
          role: 'Campaign Supporter',
          custom_role: '',
          experience: 'Event planning and community engagement',
          motivation: 'To organize successful campaign events and mobilize support',
          kc: 'KC004',
          hb: 'HB004',
          kk: 'KK004',
          created_at: '2024-01-18T13:00:00Z',
          updated_at: '2024-01-18T13:00:00Z'
        }
      ]
      setContacts(dummyContacts)

      // Load dummy payments
      const dummyPayments: Payment[] = [
        {
          id: 1,
          personName: 'John Doe',
          phoneNumber: '+256701234567',
          district: 'Kampala',
          position: 'Chairperson',
          amount: 50000,
          paymentDate: '2024-01-15',
          status: 'paid',
          reason: 'Transport allowance for campaign meeting',
          accomplished: true,
          notes: 'Transport allowance for meeting'
        },
        {
          id: 2,
          personName: 'Jane Smith',
          phoneNumber: '+256702345678',
          district: 'Entebbe',
          position: 'Secretary',
          amount: 30000,
          paymentDate: '2024-01-20',
          status: 'demanding',
          reason: 'Office supplies and materials',
          accomplished: false,
          notes: 'Pending approval'
        },
        {
          id: 3,
          personName: 'Mike Johnson',
          phoneNumber: '+256703456789',
          district: 'Jinja',
          position: 'Treasurer',
          amount: 75000,
          paymentDate: '2024-01-25',
          status: 'pending',
          reason: 'Campaign materials and printing',
          accomplished: false,
          notes: 'Awaiting budget approval'
        }
      ]
      setPayments(dummyPayments)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { 
      title: 'Total Delegates', 
      value: contacts.length.toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      description: 'Campaign team members registered'
    },
    { 
      title: 'Total Payments', 
      value: payments.length.toString(), 
      icon: DollarSign, 
      color: 'bg-green-500',
      description: 'Payments recorded and tracked'
    },
    { 
      title: 'Districts Covered', 
      value: new Set(contacts.map(c => c.district)).size.toString(), 
      icon: MapPin, 
      color: 'bg-purple-500',
      description: 'Geographic coverage areas'
    },
    { 
      title: 'Paid Amount', 
      value: `UGX ${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, 
      icon: CheckCircle, 
      color: 'bg-orange-500',
      description: 'Total amount disbursed'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'demanding': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Components.Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Components.Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your campaign management system</p>
          </div>

        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
              </div>
            ))}
          </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delegates Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delegates Management</h2>
                  <p className="text-gray-600 mt-1">Manage campaign team members and volunteers</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Delegates</span>
                  <span className="text-lg font-semibold text-gray-900">{contacts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Districts Covered</span>
                  <span className="text-lg font-semibold text-gray-900">{new Set(contacts.map(c => c.district)).size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regions</span>
                  <span className="text-lg font-semibold text-gray-900">{new Set(contacts.map(c => c.region)).size}</span>
                </div>
                <div className="pt-4">
                  <Link 
                    to="/Contacts" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    View All Delegates
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Statistics Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Campaign Statistics</h2>
                  <p className="text-gray-600 mt-1">Geographic and role distribution</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Regions</span>
                  <span className="text-lg font-semibold text-gray-900">19</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Districts</span>
                  <span className="text-lg font-semibold text-gray-900">135</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delegates</span>
                  <span className="text-lg font-semibold text-gray-900">{contacts.filter(c => c.role === 'Delegate').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ground Agents</span>
                  <span className="text-lg font-semibold text-gray-900">{contacts.filter(c => c.role === 'Ground Agent').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Digital Influencers</span>
                  <span className="text-lg font-semibold text-gray-900">{contacts.filter(c => c.role === 'Digital Influencer').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Campaign Supporters</span>
                  <span className="text-lg font-semibold text-gray-900">{contacts.filter(c => c.role === 'Campaign Supporter').length}</span>
                </div>
                <div className="pt-4">
                  <Link 
                    to="/Contacts" 
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    View All Delegates
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payments Management</h2>
                  <p className="text-gray-600 mt-1">Track campaign expenses and payments</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Payments</span>
                  <span className="text-lg font-semibold text-gray-900">{payments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    UGX {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="text-lg font-semibold text-green-600">
                    UGX {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="pt-4">
                  <Link 
                    to="/Payments" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    View All Payments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <Link 
               to="/Contacts" 
               className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <Plus className="h-6 w-6 text-blue-500 mr-3" />
               <div>
                 <p className="font-medium text-gray-900">Add New Delegate</p>
                 <p className="text-sm text-gray-600">Register a new team member</p>
               </div>
             </Link>
            <Link 
              to="/Payments" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Record Payment</p>
                <p className="text-sm text-gray-600">Add a new payment record</p>
              </div>
            </Link>
                         <Link 
               to="/MessageComposer" 
               className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
             >
               <MessageSquare className="h-6 w-6 text-purple-500 mr-3" />
               <div>
                 <p className="font-medium text-gray-900">Send Message</p>
                 <p className="text-sm text-gray-600">Send SMS to delegates</p>
               </div>
             </Link>
          </div>
        </div>
      </main>
    </div>
  )
}