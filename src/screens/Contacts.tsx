'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Search, Filter, Plus, Upload, Download, Edit, Trash2, MoreVertical, Send } from 'lucide-react'
import { Link } from '@/lib/Link'
import { Contact, contactService } from '@/lib/supabase'
import { exportContactsToCSV } from '@/utils/importExport'
import ContactForm from '@/components/ContactForm'
import ImportModal from '@/components/ImportModal'

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>()
  const [deletingContact, setDeletingContact] = useState<number | null>(null)

  const allRegions = [
    'All Regions',
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

  const allDistricts = [
    'All Districts',
    // Kigezi Region
    'Kabale', 'Rukiga', 'Rubanda', 'Kisoro', 'Rukungiri', 'Kanungu',
    // Greater Mukono Region
    'Mukono', 'Kayunga', 'Buikwe', 'Buvuma',
    // Kampala
    'Kampala Central', 'Kawempe', 'Nakawa', 'Makindye', 'Rubaga', 'Wakiso',
    // Greater Luwero
    'Luwero', 'Nakaseke', 'Nakasongola',
    // Karamoja Sub-Region
    'Moroto', 'Napak', 'Amudat', 'Nakapiripirit', 'Nabilatuk', 'Kotido', 'Abim', 'Kaabong', 'Karenga',
    // Teso Region
    'Soroti', 'Soroti City', 'Katakwi', 'Amuria', 'Kaberamaido', 'Kalaki', 'Kapelebyong', 'Ngora', 'Serere', 'Bukedea', 'Kumi',
    // Bukedi
    'Tororo', 'Tororo County', 'Butaleja', 'Busia', 'Budaka', 'Kibuku', 'Pallisa', 'Butebo',
    // Bugisu Region
    'Mbale', 'Sironko', 'Mbale City', 'Bulambuli', 'Manafwa', 'Namisindwa', 'Bududa', 'Kapchorwa', 'Kween', 'Bukwo',
    // Greater Masaka Region
    'Masaka City', 'Rakai', 'Kyotera', 'Kalangala', 'Masaka', 'Sembabule', 'Bukomansimbi', 'Lyantonde', 'Lwengo', 'Kalungu',
    // Ankole Region
    'Mbarara District', 'Mbarara City', 'Isingiro', 'Rwampara', 'Ntungamo', 'Kiruhura', 'Kazo', 'Ibanda', 'Bushenyi', 'Sheema', 'Buhweju', 'Mitooma', 'Rubirizi',
    // Rwenzori Region
    'Kasese', 'Kabarole', 'Fort Portal City', 'Bunyangabu', 'Bundibugyo', 'Ntoroko', 'Kamwenge', 'Kitagwenda', 'Kyegegwa', 'Kyenjojo',
    // Greater Mubende Region
    'Mityana', 'Mubende', 'Kasanda', 'Kyankwanzi', 'Kiboga',
    // Greater Mpigi
    'Mpigi', 'Gomba', 'Butambala',
    // Busoga Region
    'Kamuli', 'Jinja', 'Jinja City', 'Mayuge', 'Bugiri', 'Namayingo', 'Bugweri', 'Iganga', 'Kaliro', 'Luuka', 'Buyende', 'Namutumba',
    // Bunyoro Region
    'Kibaale', 'Kagadi', 'Kakumiro', 'Kiryandongo', 'Hoima', 'Hoima City', 'Kikuube', 'Masindi', 'Buliisa',
    // Lango Region
    'Lira City', 'Dokolo', 'Alebtong', 'Apac', 'Kole', 'Kwania', 'Lira', 'Amolatar', 'Otuke', 'Oyam',
    // Acholi Region
    'Gulu', 'Gulu City', 'Amuru', 'Nwoya', 'Omoro', 'Kitgum', 'Pader', 'Agago', 'Lamwo',
    // West Nile Region
    'Arua', 'Terego', 'Maracha', 'Koboko', 'Nebbi', 'Pakwach', 'Zombo', 'Yumbe', 'Moyo', 'Obongi', 'Adjumani', 'Madi-Okollo'
  ]

  const positions = ['All Positions', ...Array.from(new Set(contacts.map(c => c.position)))]

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = !selectedRegion || selectedRegion === 'All Regions' || contact.region === selectedRegion
    const matchesDistrict = !selectedDistrict || selectedDistrict === 'All Districts' || contact.district === selectedDistrict
    const matchesPosition = !selectedPosition || selectedPosition === 'All Positions' || contact.position === selectedPosition
    
    return matchesSearch && matchesRegion && matchesDistrict && matchesPosition
  })

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      // Use dummy data for now instead of Supabase
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
    } catch (error) {
      console.error('Error loading contacts:', error)
      alert('Error loading contacts. Please check your Supabase configuration.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map(c => c.id!))
    } else {
      setSelectedContacts([])
    }
  }

  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, contactId])
    } else {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId))
    }
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      setDeletingContact(contactId)
      // Remove from local state instead of calling Supabase
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      setSelectedContacts(prev => prev.filter(id => id !== contactId))
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Error deleting contact. Please try again.')
    } finally {
      setDeletingContact(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) return

    try {
      // Remove from local state instead of calling Supabase
      setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact.id!)))
      setSelectedContacts([])
    } catch (error) {
      console.error('Error deleting contacts:', error)
      alert('Error deleting contacts. Please try again.')
    }
  }

  const handleExport = () => {
    exportContactsToCSV(filteredContacts)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setShowContactForm(true)
  }

  const handleContactFormSuccess = () => {
    loadContacts()
    setEditingContact(undefined)
  }

  const handleImportSuccess = () => {
    loadContacts()
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Components.Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Components.Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              <p className="mt-2 text-gray-600">Manage your campaign contacts and supporters</p>
            </div>
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Contact
            </button>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white shadow-lg rounded-lg mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {allRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {allDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                >
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
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
              
              {selectedContacts.length > 0 && (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="text-sm text-gray-700">
                    {selectedContacts.length} contact(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <Link 
                      to="/MessageComposer" 
                      className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer flex items-center"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Message
                    </Link>
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
          </div>

          {/* Contacts Table */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                          checked={selectedContacts.includes(contact.id!)}
                          onChange={(e) => handleSelectContact(contact.id!, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {contact.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.role === 'None of the above' ? contact.custom_role : contact.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="text-yellow-600 hover:text-yellow-500 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id!)}
                            disabled={deletingContact === contact.id}
                            className="text-red-600 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          >
                            {deletingContact === contact.id ? (
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
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-lg">
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
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredContacts.length}</span> of{' '}
                  <span className="font-medium">{contacts.length}</span> results
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
      </main>

      {/* Contact Form Modal */}
      <ContactForm
        contact={editingContact}
        isOpen={showContactForm}
        onClose={() => {
          setShowContactForm(false)
          setEditingContact(undefined)
        }}
        onSuccess={handleContactFormSuccess}
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