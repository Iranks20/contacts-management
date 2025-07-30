import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, MapPin, Briefcase, Mail, MessageSquare, Award, Building } from 'lucide-react'
import { Contact, contactService } from '@/lib/supabase'

interface ContactFormProps {
  contact?: Contact
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ContactForm({ contact, isOpen, onClose, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    region: '',
    district: '',
    position: '',
    role: '',
    custom_role: '',
    experience: '',
    motivation: '',
    kc: '',
    hb: '',
    kk: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showCustomRole, setShowCustomRole] = useState(false)

  const volunteerRoles = [
    'Delegate',
    'Ground Agent',
    'Digital Influencer',
    'Campaign Supporter',
    'None of the above'
  ]

  const regions = [
    'Kigezi Region',
    'Greater Mukono Region',
    'Kampala',
    'Greater Luwero',
    'Karamoja Sub-Region',
    'Teso Region',
    'Bukedi',
    'Bugisu Region',
    'Greater Masaka Region',
    'Ankole Region',
    'Rwenzori Region',
    'Greater Mubende Region',
    'Greater Mpigi',
    'Busoga Region',
    'Bunyoro Region',
    'Lango Region',
    'Acholi Region',
    'West Nile Region',
    'None of the above'
  ]

  const regionDistricts: { [key: string]: string[] } = {
    'Kigezi Region': ['Kabale', 'Rukiga', 'Rubanda', 'Kisoro', 'Rukungiri', 'Kanungu'],
    'Greater Mukono Region': ['Mukono', 'Kayunga', 'Buikwe', 'Buvuma'],
    'Kampala': ['Kampala Central', 'Kawempe', 'Nakawa', 'Makindye', 'Rubaga', 'Wakiso'],
    'Greater Luwero': ['Luwero', 'Nakaseke', 'Nakasongola'],
    'Karamoja Sub-Region': ['Moroto', 'Napak', 'Amudat', 'Nakapiripirit', 'Nabilatuk', 'Kotido', 'Abim', 'Kaabong', 'Karenga'],
    'Teso Region': ['Soroti', 'Soroti City', 'Katakwi', 'Amuria', 'Kaberamaido', 'Kalaki', 'Kapelebyong', 'Ngora', 'Serere', 'Bukedea', 'Kumi'],
    'Bukedi': ['Tororo', 'Tororo County', 'Butaleja', 'Busia', 'Budaka', 'Kibuku', 'Pallisa', 'Butebo'],
    'Bugisu Region': ['Mbale', 'Sironko', 'Mbale City', 'Bulambuli', 'Manafwa', 'Namisindwa', 'Bududa', 'Kapchorwa', 'Kween', 'Bukwo'],
    'Greater Masaka Region': ['Masaka City', 'Rakai', 'Kyotera', 'Kalangala', 'Masaka', 'Sembabule', 'Bukomansimbi', 'Lyantonde', 'Lwengo', 'Kalungu'],
    'Ankole Region': ['Mbarara District', 'Mbarara City', 'Isingiro', 'Rwampara', 'Ntungamo', 'Kiruhura', 'Kazo', 'Ibanda', 'Bushenyi', 'Sheema', 'Buhweju', 'Mitooma', 'Rubirizi'],
    'Rwenzori Region': ['Kasese', 'Kabarole', 'Fort Portal City', 'Bunyangabu', 'Bundibugyo', 'Ntoroko', 'Kamwenge', 'Kitagwenda', 'Kyegegwa', 'Kyenjojo'],
    'Greater Mubende Region': ['Mityana', 'Mubende', 'Kasanda', 'Kyankwanzi', 'Kiboga'],
    'Greater Mpigi': ['Mpigi', 'Gomba', 'Butambala'],
    'Busoga Region': ['Kamuli', 'Jinja', 'Jinja City', 'Mayuge', 'Bugiri', 'Namayingo', 'Bugweri', 'Iganga', 'Kaliro', 'Luuka', 'Buyende', 'Namutumba'],
    'Bunyoro Region': ['Kibaale', 'Kagadi', 'Kakumiro', 'Kiryandongo', 'Hoima', 'Hoima City', 'Kikuube', 'Masindi', 'Buliisa'],
    'Lango Region': ['Lira City', 'Dokolo', 'Alebtong', 'Apac', 'Kole', 'Kwania', 'Lira', 'Amolatar', 'Otuke', 'Oyam'],
    'Acholi Region': ['Gulu', 'Gulu City', 'Amuru', 'Nwoya', 'Omoro', 'Kitgum', 'Pader', 'Agago', 'Lamwo'],
    'West Nile Region': ['Arua', 'Terego', 'Maracha', 'Koboko', 'Nebbi', 'Pakwach', 'Zombo', 'Yumbe', 'Moyo', 'Obongi', 'Adjumani', 'Madi-Okollo']
  }

  useEffect(() => {
    if (contact) {
      setFormData({
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        region: contact.region,
        district: contact.district,
        position: contact.position,
        role: contact.role,
        custom_role: contact.custom_role,
        experience: contact.experience,
        motivation: contact.motivation,
        kc: contact.kc,
        hb: contact.hb,
        kk: contact.kk
      })
      setSelectedRegion(contact.region)
      setSelectedRole(contact.role)
      setShowCustomRole(contact.role === 'None of the above')
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        region: '',
        district: '',
        position: '',
        role: '',
        custom_role: '',
        experience: '',
        motivation: '',
        kc: '',
        hb: '',
        kk: ''
      })
      setSelectedRegion('')
      setSelectedRole('')
      setShowCustomRole(false)
    }
    setErrors({})
  }, [contact, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+256\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +256XXXXXXXXX'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.region) {
      newErrors.region = 'Region is required'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (!formData.position) {
      newErrors.position = 'Position is required'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    if (showCustomRole && !formData.custom_role.trim()) {
      newErrors.custom_role = 'Custom role is required'
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Motivation is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // For now, just call onSuccess to close the form
      // The actual contact management will be handled by the parent component
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

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setFormData(prev => ({ ...prev, region: region, district: '' }))
    if (region === 'None of the above') {
      setShowCustomRole(true)
    } else {
      setShowCustomRole(false)
    }
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setFormData(prev => ({ ...prev, role: role, custom_role: role === 'None of the above' ? '' : '' }))
    if (role === 'None of the above') {
      setShowCustomRole(true)
    } else {
      setShowCustomRole(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+256 700 000 000"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Region and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Region *
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                District *
              </label>
              {selectedRegion === 'None of the above' ? (
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your district"
                />
              ) : (
                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a district</option>
                  {selectedRegion && regionDistricts[selectedRegion] && regionDistricts[selectedRegion].map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              )}
              {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
            </div>
          </div>

          {/* Position and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-2" />
                Position *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Chairperson, Gen. Secretary, etc."
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="h-4 w-4 inline mr-2" />
                KC (Optional)
              </label>
              <input
                type="text"
                value={formData.kc}
                onChange={(e) => handleInputChange('kc', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="KC information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-2" />
                HB (Optional)
              </label>
              <input
                type="text"
                value={formData.hb}
                onChange={(e) => handleInputChange('hb', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="HB information"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="h-4 w-4 inline mr-2" />
                KK (Optional)
              </label>
              <input
                type="text"
                value={formData.kk}
                onChange={(e) => handleInputChange('kk', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="KK information"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="h-4 w-4 inline mr-2" />
              Role Interested In *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a role</option>
              {volunteerRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}

            {showCustomRole && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Your Role *
                </label>
                <input
                  type="text"
                  value={formData.custom_role}
                  onChange={(e) => handleInputChange('custom_role', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                    errors.custom_role ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your custom role"
                />
                {errors.custom_role && <p className="mt-1 text-sm text-red-600">{errors.custom_role}</p>}
              </div>
            )}
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Relevant Experience
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Tell us about your relevant experience, skills, or previous volunteer work..."
            />
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-2" />
              Why do you want to join King Ceasor's campaign? *
            </label>
            <textarea
              value={formData.motivation}
              onChange={(e) => handleInputChange('motivation', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 ${
                errors.motivation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Share your motivation and what you hope to achieve through joining the campaign..."
            />
            {errors.motivation && <p className="mt-1 text-sm text-red-600">{errors.motivation}</p>}
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