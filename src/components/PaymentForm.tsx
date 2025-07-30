'use client'
import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, MapPin, Briefcase, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react'

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

interface PaymentFormProps {
  payment?: Payment
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentForm({ payment, isOpen, onClose, onSuccess }: PaymentFormProps) {
  const [formData, setFormData] = useState<Payment>({
    personName: '',
    phoneNumber: '',
    district: '',
    position: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    reason: '',
    accomplished: false,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Payment>>({})

  useEffect(() => {
    if (payment) {
      setFormData(payment)
    } else {
      setFormData({
        personName: '',
        phoneNumber: '',
        district: '',
        position: '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        reason: '',
        accomplished: false,
        notes: ''
      })
    }
    setErrors({})
  }, [payment, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Payment> = {}

    if (!formData.personName.trim()) {
      newErrors.personName = 'Person name is required'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required'
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      // In a real app, this would call a service to save to database
      // For now, we'll simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSuccess()
    } catch (error) {
      console.error('Error saving payment:', error)
      alert('Error saving payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Payment, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {payment ? 'Edit Payment' : 'Add New Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Person Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Person Name *
              </label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) => handleInputChange('personName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.personName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter person's full name"
              />
              {errors.personName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.personName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+256701234567"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                District *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter district"
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.district}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Position *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter position/role"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.position}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Amount (UGX) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.paymentDate}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'paid' | 'demanding' | 'pending')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="demanding">Demanding</option>
              </select>
            </div>
          </div>

          {/* Reason and Accomplished */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Reason for Payment *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the reason for this payment..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Accomplished */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Accomplished
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                                     <input
                     type="radio"
                     name="accomplished"
                     value="true"
                     checked={formData.accomplished === true}
                     onChange={(e) => handleInputChange('accomplished', true)}
                     className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                   />
                  <span className="ml-2 text-sm text-gray-700">✓ Completed</span>
                </label>
                <label className="flex items-center">
                                     <input
                     type="radio"
                     name="accomplished"
                     value="false"
                     checked={formData.accomplished === false}
                     onChange={(e) => handleInputChange('accomplished', false)}
                     className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                   />
                  <span className="ml-2 text-sm text-gray-700">✗ Pending</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Additional notes about the payment..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {payment ? 'Update Payment' : 'Save Payment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 