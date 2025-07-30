import { Contact } from '@/lib/supabase'

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

// Export contacts to CSV
export const exportContactsToCSV = (contacts: Contact[]) => {
  const headers = ['Full Name', 'Email', 'Phone', 'Region', 'District', 'Position', 'Role', 'Custom Role', 'Experience', 'Motivation', 'KC', 'HB', 'KK']
  const csvContent = [
    headers.join(','),
    ...contacts.map(contact => [
      `"${contact.full_name}"`,
      `"${contact.email}"`,
      `"${contact.phone}"`,
      `"${contact.region}"`,
      `"${contact.district}"`,
      `"${contact.position}"`,
      `"${contact.role}"`,
      `"${contact.custom_role}"`,
      `"${contact.experience}"`,
      `"${contact.motivation}"`,
      `"${contact.kc}"`,
      `"${contact.hb}"`,
      `"${contact.kk}"`
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
    if (values.length >= 13) {
      contacts.push({
        full_name: values[0] || '',
        email: values[1] || '',
        phone: values[2] || '',
        region: values[3] || '',
        district: values[4] || '',
        position: values[5] || '',
        role: values[6] || '',
        custom_role: values[7] || '',
        experience: values[8] || '',
        motivation: values[9] || '',
        kc: values[10] || '',
        hb: values[11] || '',
        kk: values[12] || ''
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
  
  if (!contact.full_name?.trim()) {
    errors.push('Full name is required')
  }
  
  if (!contact.phone?.trim()) {
    errors.push('Phone number is required')
  } else if (!/^\+256\d{9}$/.test(contact.phone)) {
    errors.push('Phone must be in format +256XXXXXXXXX')
  }
  
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    errors.push('Please enter a valid email address')
  }
  
  if (!contact.region?.trim()) {
    errors.push('Region is required')
  }
  
  if (!contact.district?.trim()) {
    errors.push('District is required')
  }
  
  if (!contact.position?.trim()) {
    errors.push('Position is required')
  }
  
  if (!contact.role?.trim()) {
    errors.push('Role is required')
  }
  
  if (!contact.motivation?.trim()) {
    errors.push('Motivation is required')
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

// Export payments to CSV
export const exportPaymentsToCSV = (payments: Payment[]) => {
  const headers = ['Person Name', 'Phone Number', 'District', 'Position', 'Amount', 'Payment Date', 'Status', 'Reason', 'Accomplished', 'Notes']
  const csvContent = [
    headers.join(','),
    ...payments.map(payment => [
      `"${payment.personName}"`,
      `"${payment.phoneNumber}"`,
      `"${payment.district}"`,
      `"${payment.position}"`,
      `"${payment.amount}"`,
      `"${payment.paymentDate}"`,
      `"${payment.status}"`,
      `"${payment.reason}"`,
      `"${payment.accomplished}"`,
      `"${payment.notes || ''}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Parse payments CSV content
export const parsePaymentsCSV = (csvText: string): Payment[] => {
  const lines = csvText.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const payments: Payment[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    if (values.length >= 8) {
      payments.push({
        personName: values[0] || '',
        phoneNumber: values[1] || '',
        district: values[2] || '',
        position: values[3] || '',
        amount: parseInt(values[4]) || 0,
        paymentDate: values[5] || new Date().toISOString().split('T')[0],
        status: (values[6] as 'paid' | 'demanding' | 'pending') || 'pending',
        reason: values[7] || '',
        accomplished: values[8] === 'true',
        notes: values[9] || ''
      })
    }
  }
  
  return payments
}

// Parse payments Excel file (XLSX)
export const parsePaymentsExcelFile = async (file: File): Promise<Payment[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const payments = parsePaymentsCSV(data)
        resolve(payments)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Validate payment data
export const validatePaymentData = (payment: Partial<Payment>): string[] => {
  const errors: string[] = []
  
  if (!payment.personName?.trim()) {
    errors.push('Person name is required')
  }
  
  if (!payment.phoneNumber?.trim()) {
    errors.push('Phone number is required')
  }
  
  if (!payment.district?.trim()) {
    errors.push('District is required')
  }
  
  if (!payment.position?.trim()) {
    errors.push('Position is required')
  }
  
  if (!payment.amount || payment.amount <= 0) {
    errors.push('Amount must be greater than 0')
  }
  
  if (!payment.paymentDate?.trim()) {
    errors.push('Payment date is required')
  }
  
  if (!payment.reason?.trim()) {
    errors.push('Reason is required')
  }
  
  if (payment.status && !['paid', 'demanding', 'pending'].includes(payment.status)) {
    errors.push('Status must be paid, demanding, or pending')
  }
  
  return errors
}

// Validate multiple payments
export const validatePayments = (payments: Partial<Payment>[]): { valid: Payment[], invalid: { payment: Partial<Payment>, errors: string[] }[] } => {
  const valid: Payment[] = []
  const invalid: { payment: Partial<Payment>, errors: string[] }[] = []
  
  payments.forEach(payment => {
    const errors = validatePaymentData(payment)
    if (errors.length === 0) {
      valid.push(payment as Payment)
    } else {
      invalid.push({ payment, errors })
    }
  })
  
  return { valid, invalid }
} 