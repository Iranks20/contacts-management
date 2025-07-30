import React, { useState, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Contact, contactService } from '@/lib/supabase'
import { parseExcelFile, validateContacts } from '@/utils/importExport'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [importResults, setImportResults] = useState<{
    valid: Contact[]
    invalid: { contact: Partial<Contact>, errors: string[] }[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResults(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const contacts = await parseExcelFile(file)
      const results = validateContacts(contacts)
      setImportResults(results)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error parsing file. Please make sure it\'s a valid CSV or Excel file.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!importResults?.valid.length) return

    setLoading(true)
    try {
      // Import valid contacts to Supabase
      for (const contact of importResults.valid) {
        await contactService.createContact(contact)
      }
      
      alert(`Successfully imported ${importResults.valid.length} contacts!`)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error importing contacts:', error)
      alert('Error importing contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'Name,Telephone,Number,District,Position\n"John Doe","+256701234567","+256781234567","Kampala Central","Coordinator"'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'contacts_template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFile(null)
    setImportResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Contacts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          {!importResults && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Contact File</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV or Excel file with contact information. The file should have columns for Name, Telephone, Number, District, and Position.
                </p>
                
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-500 mb-4"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {file ? file.name : 'No file chosen'}
                  </p>
                </div>
              </div>

              {file && (
                <div className="flex justify-end">
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import Contacts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Import Results Section */}
          {importResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Import Another File
                </button>
              </div>

              {/* Valid Contacts */}
              {importResults.valid.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      {importResults.valid.length} contacts ready to import
                    </span>
                  </div>
                </div>
              )}

              {/* Invalid Contacts */}
              {importResults.invalid.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">
                      {importResults.invalid.length} contacts have errors
                    </span>
                  </div>
                  <div className="text-sm text-red-700 space-y-1">
                    {importResults.invalid.slice(0, 3).map((item, index) => (
                      <div key={index}>
                        <strong>{item.contact.name || 'Unknown'}:</strong> {item.errors.join(', ')}
                      </div>
                    ))}
                    {importResults.invalid.length > 3 && (
                      <div>... and {importResults.invalid.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                {importResults.valid.length > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={loading}
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import {importResults.valid.length} Contacts
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 