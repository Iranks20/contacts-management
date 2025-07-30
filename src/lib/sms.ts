// Africa's Talking SMS Service
// Documentation: https://africastalking.com/docs/sms

interface SMSConfig {
  apiKey: string
  username: string
  senderId?: string
}

interface SMSMessage {
  to: string
  message: string
  from?: string
}

interface BulkSMSRequest {
  recipients: string[]
  message: string
  senderId?: string
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
  cost?: string
}

class SMSService {
  private config: SMSConfig
  private baseUrl = 'https://api.africastalking.com/version1'
  private apiUrl = 'https://sms-api-vlkr.onrender.com/api/sms/send'

  constructor(config: SMSConfig) {
    this.config = config
  }

  // Send a single SMS
  async sendSMS(to: string, message: string, from?: string): Promise<SMSResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(to),
          message: message,
        }),
      })

      const data = await response.json()
      
      if (data.success && data.response?.SMSMessageData?.Recipients?.[0]) {
        const smsData = data.response.SMSMessageData.Recipients[0]
        return {
          success: smsData.status === 'Success',
          messageId: smsData.messageId,
          cost: smsData.cost,
          error: smsData.status !== 'Success' ? smsData.status : undefined,
        }
      }

      return {
        success: false,
        error: data.error || 'Failed to send SMS',
      }
    } catch (error) {
      console.error('SMS sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Send bulk SMS
  async sendBulkSMS(recipients: string[], message: string, from?: string): Promise<SMSResponse[]> {
    try {
      const formattedRecipients = recipients.map(phone => this.formatPhoneNumber(phone))
      const recipientsString = formattedRecipients.join(',')
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientsString,
          message: message,
        }),
      })

      const data = await response.json()
      
      if (data.success && data.response?.SMSMessageData?.Recipients) {
        return data.response.SMSMessageData.Recipients.map((recipient: any) => ({
          success: recipient.status === 'Success',
          messageId: recipient.messageId,
          cost: recipient.cost,
          error: recipient.status !== 'Success' ? recipient.status : undefined,
        }))
      }

      return recipients.map(() => ({
        success: false,
        error: data.error || 'Failed to send SMS',
      }))
    } catch (error) {
      console.error('Bulk SMS sending error:', error)
      return recipients.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  // Format phone number for Uganda (+256)
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // If it starts with 0, replace with 256
    if (cleaned.startsWith('0')) {
      cleaned = '256' + cleaned.substring(1)
    }
    
    // If it doesn't start with 256, add it
    if (!cleaned.startsWith('256')) {
      cleaned = '256' + cleaned
    }
    
    // Add + prefix
    return '+' + cleaned
  }

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone)
    // Uganda numbers should be +256XXXXXXXXX (12 digits total)
    return /^\+256\d{9}$/.test(formatted)
  }

  // Get SMS balance - Not available with current API
  async getBalance(): Promise<{ balance: string; currency: string } | null> {
    // Balance endpoint not available with current API
    console.warn('Balance checking not available with current API')
    return null
  }
}

const smsConfig: SMSConfig = {
  apiKey: '', // Not needed - handled by backend
  username: '', // Not needed - handled by backend
  // Removed senderId to use Africa's Talking default
}

// Create SMS service instance
export const smsService = new SMSService(smsConfig)

// Helper functions for the application
export const smsHelpers = {
  // Send message to selected contacts
  async sendToContacts(contacts: any[], message: string): Promise<{
    success: number
    failed: number
    results: SMSResponse[]
  }> {
    const phoneNumbers = contacts.map(contact => contact.telephone || contact.number)
    const validNumbers = phoneNumbers.filter(phone => smsService.validatePhoneNumber(phone))
    
    if (validNumbers.length === 0) {
      return {
        success: 0,
        failed: 0,
        results: [],
      }
    }

    const results = await smsService.sendBulkSMS(validNumbers, message)
    const success = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return {
      success,
      failed,
      results,
    }
  },

  // Estimate SMS cost
  estimateCost(recipientCount: number): string {
    // Africa's Talking cost is approximately $0.02-0.03 per SMS
    const costPerSMS = 0.025 // Average cost
    const totalCost = recipientCount * costPerSMS
    return `$${totalCost.toFixed(2)}`
  },

  // Validate message length
  validateMessage(message: string): { isValid: boolean; length: number; maxLength: number } {
    const maxLength = 160 // Standard SMS character limit
    const length = message.length
    
    return {
      isValid: length <= maxLength,
      length,
      maxLength,
    }
  },
} 