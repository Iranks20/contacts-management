'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { 
  DollarSign, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  FileText
} from 'lucide-react'
import { Link } from '@/lib/Link'
import { Contact, contactService } from '@/lib/supabase'
import { exportPaymentsToCSV } from '@/utils/importExport'
import PaymentForm from '@/components/PaymentForm'
import ImportModal from '@/components/ImportModal'

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
  createdAt?: string
  updatedAt?: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>()
  const [deletingPayment, setDeletingPayment] = useState<number | null>(null)

  // Load sample data for demonstration
  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      // For now, we'll use sample data. In a real app, this would come from Supabase
      const samplePayments: Payment[] = [
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
          notes: 'Office supplies reimbursement'
        }
      ]
      setPayments(samplePayments)
    } catch (error) {
      console.error('Error loading payments:', error)
      alert('Error loading payments.')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { 
      title: 'Total Payments', 
      value: payments.length.toString(), 
      icon: DollarSign, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Total Amount', 
      value: `UGX ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Paid', 
      value: payments.filter(p => p.status === 'paid').length.toString(), 
      icon: CheckCircle, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Demanding', 
      value: payments.filter(p => p.status === 'demanding').length.toString(), 
      icon: AlertCircle, 
      color: 'bg-orange-500' 
    }
  ]

  const districts = ['All Districts', ...Array.from(new Set(payments.map(p => p.district)))]
  const statuses = ['All Statuses', 'paid', 'demanding', 'pending']

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phoneNumber.includes(searchTerm) ||
                         payment.district.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDistrict = !selectedDistrict || selectedDistrict === 'All Districts' || payment.district === selectedDistrict
    const matchesStatus = !selectedStatus || selectedStatus === 'All Statuses' || payment.status === selectedStatus
    
    return matchesSearch && matchesDistrict && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(filteredPayments.map(p => p.id!))
    } else {
      setSelectedPayments([])
    }
  }

  const handleSelectPayment = (paymentId: number, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId])
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId))
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return

    try {
      setDeletingPayment(paymentId)
      // In a real app, this would call a service to delete from database
      setPayments(payments.filter(p => p.id !== paymentId))
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Error deleting payment. Please try again.')
    } finally {
      setDeletingPayment(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPayments.length} payment records?`)) return

    try {
      setPayments(payments.filter(p => !selectedPayments.includes(p.id!)))
      setSelectedPayments([])
    } catch (error) {
      console.error('Error deleting payments:', error)
      alert('Error deleting payments. Please try again.')
    }
  }

  const handleExport = () => {
    exportPaymentsToCSV(payments)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setShowPaymentForm(true)
  }

  const handlePaymentFormSuccess = () => {
    setShowPaymentForm(false)
    setEditingPayment(undefined)
    loadPayments()
  }

  const handleImportSuccess = () => {
    setShowImportModal(false)
    loadPayments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'demanding':
        return 'bg-orange-100 text-orange-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'demanding':
        return <AlertCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Components.Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
                <p className="mt-2 text-sm text-gray-600">Record and manage all payments made to campaign personnel</p>
              </div>
              <button
                onClick={() => setShowPaymentForm(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Payment
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                        <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters and Actions */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
              
              {selectedPayments.length > 0 && (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-sm text-gray-700">
                    {selectedPayments.length} payment(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                        checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accomplished</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                          checked={selectedPayments.includes(payment.id!)}
                          onChange={(e) => handleSelectPayment(payment.id!, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.personName}</div>
                          <div className="text-sm text-gray-500">{payment.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {payment.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        UGX {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={payment.reason}>
                          {payment.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.accomplished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.accomplished ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-yellow-600 hover:text-yellow-500 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id!)}
                            disabled={deletingPayment === payment.id}
                            className="text-red-600 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          >
                            {deletingPayment === payment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPayments.length}</span> of{' '}
                    <span className="font-medium">{payments.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer">
                      Previous
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-yellow-50 text-sm font-medium text-yellow-600 cursor-pointer">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer">
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Form Modal */}
      <PaymentForm
        payment={editingPayment}
        isOpen={showPaymentForm}
        onClose={() => {
          setShowPaymentForm(false)
          setEditingPayment(undefined)
        }}
        onSuccess={handlePaymentFormSuccess}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
} 