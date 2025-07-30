import { Contact } from '@/lib/supabase'

// Export contacts to CSV
export const exportContactsToCSV = (contacts: Contact[]) => {
  const headers = ['Name', 'Telephone', 'Number', 'District', 'Position']
  const csvContent = [
    headers.join(','),
    ...contacts.map(contact => [
      `"${contact.name}"`,
      `"${contact.telephone}"`,
      `"${contact.number}"`,
      `"${contact.district}"`,
      `"${contact.position}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Parse CSV content
export const parseCSV = (csvText: string): Contact[] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const contacts: Contact[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    if (values.length >= 5) {
      contacts.push({
        name: values[0] || '',
        telephone: values[1] || '',
        number: values[2] || '',
        district: values[3] || '',
        position: values[4] || ''
      })
    }
  }
  
  return contacts
}

// Parse Excel file (XLSX)
export const parseExcelFile = async (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const contacts = parseCSV(data)
        resolve(contacts)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Validate contact data
export const validateContactData = (contact: Partial<Contact>): string[] => {
  const errors: string[] = []
  
  if (!contact.name?.trim()) {
    errors.push('Name is required')
  }
  
  if (!contact.telephone?.trim()) {
    errors.push('Telephone is required')
  } else if (!/^\+256\d{9}$/.test(contact.telephone)) {
    errors.push('Telephone must be in format +256XXXXXXXXX')
  }
  
  if (!contact.number?.trim()) {
    errors.push('Number is required')
  } else if (!/^\+256\d{9}$/.test(contact.number)) {
    errors.push('Number must be in format +256XXXXXXXXX')
  }
  
  if (!contact.district?.trim()) {
    errors.push('District is required')
  }
  
  if (!contact.position?.trim()) {
    errors.push('Position is required')
  }
  
  return errors
}

// Validate multiple contacts
export const validateContacts = (contacts: Partial<Contact>[]): { valid: Contact[], invalid: { contact: Partial<Contact>, errors: string[] }[] } => {
  const valid: Contact[] = []
  const invalid: { contact: Partial<Contact>, errors: string[] }[] = []
  
  contacts.forEach(contact => {
    const errors = validateContactData(contact)
    if (errors.length === 0) {
      valid.push(contact as Contact)
    } else {
      invalid.push({ contact, errors })
    }
  })
  
  return { valid, invalid }
} 