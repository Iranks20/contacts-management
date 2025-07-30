import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, MapPin, Briefcase } from 'lucide-react'
import { Contact, contactService } from '@/lib/supabase'

interface ContactFormProps {
  contact?: Contact
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ContactForm({ contact, isOpen, onClose, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    telephone: '',
    number: '',
    district: '',
    position: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const districts = ['Kampala Central', 'Wakiso', 'Entebbe', 'Jinja', 'Mukono', 'Masaka']
  const positions = ['Coordinator', 'Volunteer', 'Leader', 'Manager', 'Assistant']

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        telephone: contact.telephone,
        number: contact.number,
        district: contact.district,
        position: contact.position
      })
    } else {
      setFormData({
        name: '',
        telephone: '',
        number: '',
        district: '',
        position: ''
      })
    }
    setErrors({})
  }, [contact, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone is required'
    } else if (!/^\+256\d{9}$/.test(formData.telephone)) {
      newErrors.telephone = 'Telephone must be in format +256XXXXXXXXX'
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Number is required'
    } else if (!/^\+256\d{9}$/.test(formData.number)) {
      newErrors.number = 'Number must be in format +256XXXXXXXXX'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (!formData.position) {
      newErrors.position = 'Position is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      if (contact) {
        await contactService.updateContact(contact.id!, formData)
      } else {
        await contactService.createContact(formData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving contact:', error)
      alert('Error saving contact. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Telephone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Telephone
            </label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.telephone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+256701234567"
            />
            {errors.telephone && <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>}
          </div>

          {/* Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Number
            </label>
            <input
              type="tel"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+256781234567"
            />
            {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
          </div>

          {/* District Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              District
            </label>
            <select
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
          </div>

          {/* Position Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 inline mr-2" />
              Position
            </label>
            <select
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Position</option>
              {positions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
            {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {contact ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 