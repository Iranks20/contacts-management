'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Users, MapPin, MessageSquare, Plus, Upload, Send, TrendingUp, Clock, Search, Filter, Download, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Link } from '@/lib/Link'
import { Contact, contactService } from '@/lib/supabase'
import { exportContactsToCSV } from '@/utils/importExport'
import ContactForm from '@/components/ContactForm'
import ImportModal from '@/components/ImportModal'

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>()
  const [deletingContact, setDeletingContact] = useState<number | null>(null)

  const stats = [
    { title: 'Total Contacts', value: contacts.length.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'Districts', value: new Set(contacts.map(c => c.district)).size.toString(), icon: MapPin, color: 'bg-green-500' },
    { title: 'Messages Sent', value: '89', icon: MessageSquare, color: 'bg-purple-500' },
    { title: 'This Month', value: '34', icon: TrendingUp, color: 'bg-orange-500' }
  ]

  const districts = ['All Districts', ...Array.from(new Set(contacts.map(c => c.district)))]
  const positions = ['All Positions', ...Array.from(new Set(contacts.map(c => c.position)))]

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.telephone.includes(searchTerm) ||
                         contact.number.includes(searchTerm)
    const matchesDistrict = !selectedDistrict || selectedDistrict === 'All Districts' || contact.district === selectedDistrict
    const matchesPosition = !selectedPosition || selectedPosition === 'All Positions' || contact.position === selectedPosition
    
    return matchesSearch && matchesDistrict && matchesPosition
  })

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await contactService.getContacts()
      setContacts(data)
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
      await contactService.deleteContact(contactId)
      await loadContacts()
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
      await contactService.deleteContacts(selectedContacts)
      await loadContacts()
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your campaign.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-lg rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer"
                >
                  <Plus className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-900">Add New Contact</span>
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center justify-center px-6 py-4 border border-gray-300 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer"
                >
                  <Upload className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="font-medium text-gray-900">Import Contacts</span>
                </button>
                <Link to="/MessageComposer" className="flex items-center justify-center px-6 py-4 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors cursor-pointer">
                  <Send className="h-5 w-5 mr-3" />
                  <span className="font-medium">Send Message</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
            </div>
            
            {/* Filters and Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {districts.map(district => (
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

            {/* Contacts Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telephone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {contact.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.telephone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.number}</td>
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