'use client'
import React, { useState, useEffect } from 'react'
import Components from '../components'
import { Send, Users, Calendar, MessageSquare, Smartphone, CheckCircle, AlertCircle, DollarSign, Clock } from 'lucide-react'
import { Link } from '@/lib/Link'
import { Contact, contactService } from '@/lib/supabase'
import { smsService, smsHelpers } from '@/lib/sms'

export default function MessageComposer() {
  const [message, setMessage] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('SMS')
  const [recipientType, setRecipientType] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  const districts = ['All Districts', ...Array.from(new Set(contacts.map(c => c.district)))]
  const positions = ['All Positions', ...Array.from(new Set(contacts.map(c => c.position)))]

  // Load contacts on component mount
  useEffect(() => {
    loadContacts()
    loadBalance()
  }, [])

  const loadContacts = async () => {
    try {
      const data = await contactService.getContacts()
      setContacts(data)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadBalance = async () => {
    try {
      const balanceData = await smsService.getBalance()
      if (balanceData) {
        setBalance(`${balanceData.balance} ${balanceData.currency}`)
      }
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const getFilteredContacts = () => {
    let filtered = contacts

    if (recipientType === 'filtered') {
      if (selectedDistrict && selectedDistrict !== 'All Districts') {
        filtered = filtered.filter(c => c.district === selectedDistrict)
      }
      if (selectedPosition && selectedPosition !== 'All Positions') {
        filtered = filtered.filter(c => c.position === selectedPosition)
      }
    }

    return filtered
  }

  const getRecipientCount = () => {
    if (recipientType === 'all') return contacts.length
    if (recipientType === 'filtered') {
      return getFilteredContacts().length
    }
    return 0
  }

  const getEstimatedCost = () => {
    const count = getRecipientCount()
    return smsHelpers.estimateCost(count)
  }

  const validateMessage = () => {
    const validation = smsHelpers.validateMessage(message)
    return validation.isValid
  }

  const handleSendMessage = async () => {
    if (!validateMessage()) {
      alert('Message is too long. Please keep it under 160 characters.')
      return
    }

    const recipients = getFilteredContacts()
    if (recipients.length === 0) {
      alert('No recipients selected.')
      return
    }

    setSending(true)
    try {
      const result = await smsHelpers.sendToContacts(recipients, message)
      
      if (result.success > 0) {
        alert(`Message sent successfully!\n\n✅ Sent: ${result.success}\n❌ Failed: ${result.failed}`)
    setMessage('')
    setShowPreview(false)
      } else {
        alert(`Failed to send messages.\n\n❌ Failed: ${result.failed}`)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      alert('Error sending messages. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleScheduleMessage = () => {
    // For now, just send immediately
    // In a real implementation, you'd store this in a database for later sending
    alert('Message scheduling will be implemented in the next version.')
    handleSendMessage()
  }

  const messageValidation = smsHelpers.validateMessage(message)

  return (
    <div className="min-h-screen bg-gray-50">
      <Components.Header />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Send Message</h1>
            <p className="mt-2 text-gray-600">Compose and send messages to your campaign contacts</p>
          </div>

          {!showPreview ? (
            <div className="space-y-6">
              {/* Message Composition */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Compose Message</h2>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message Content
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500 resize-none ${
                        !messageValidation.isValid && message.length > 0 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="mt-2 flex justify-between text-sm">
                      <span className={messageValidation.isValid ? 'text-gray-500' : 'text-red-600'}>
                        {messageValidation.isValid ? 'Message length OK' : 'Message too long'}
                      </span>
                      <span className={messageValidation.isValid ? 'text-gray-500' : 'text-red-600'}>
                        {message.length}/{messageValidation.maxLength} characters
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Delivery Method</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="SMS"
                        checked={deliveryMethod === 'SMS'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg transition-colors ${
                        deliveryMethod === 'SMS' 
                          ? 'border-yellow-500 bg-yellow-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="flex items-center">
                          <Smartphone className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">SMS</h3>
                            <p className="text-sm text-gray-500">Send via SMS (MTN, Airtel)</p>
                            <p className="text-xs text-gray-400 mt-1">~$0.025 per message</p>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative cursor-pointer opacity-50">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="WhatsApp"
                        checked={deliveryMethod === 'WhatsApp'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="sr-only"
                        disabled
                      />
                      <div className="p-4 border-2 rounded-lg border-gray-300 bg-gray-50">
                        <div className="flex items-center">
                          <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">WhatsApp</h3>
                            <p className="text-sm text-gray-500">Coming soon</p>
                            <p className="text-xs text-gray-400 mt-1">Not available yet</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Recipient Selection */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Select Recipients</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recipientType"
                        value="all"
                        checked={recipientType === 'all'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        All Contacts ({contacts.length})
                      </span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="recipientType"
                        value="filtered"
                        checked={recipientType === 'filtered'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">Filtered Contacts</span>
                    </label>
                    
                    {recipientType === 'filtered' && (
                      <div className="ml-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                          >
                            {districts.map(district => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 cursor-pointer"
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                          >
                            {positions.map(position => (
                              <option key={position} value={position}>{position}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {getRecipientCount()} recipients will receive this message
                      </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Estimated cost: {getEstimatedCost()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Balance */}
              {balance && (
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Account Balance</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        Current balance: {balance}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!message.trim() || !validateMessage()}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!message.trim() || !validateMessage() || getRecipientCount() === 0}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-medium flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5 mr-2" />
                  {scheduleDate && scheduleTime ? 'Schedule Message' : 'Send Now'}
                </button>
              </div>
            </div>
          ) : (
            /* Preview Screen */
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Message Preview</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Message Content</h3>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{message}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Method</h3>
                      <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-gray-900">SMS</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Recipients</h3>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="text-gray-900">{getRecipientCount()} contacts</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Estimated Cost</h3>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="text-gray-900">{getEstimatedCost()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Confirm Message Details</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Please review your message carefully. Once sent, this action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={sending ? undefined : (scheduleDate && scheduleTime ? handleScheduleMessage : handleSendMessage)}
                      disabled={sending}
                      className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-medium flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {scheduleDate && scheduleTime ? 'Confirm Schedule' : 'Send Message'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}