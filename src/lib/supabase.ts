import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://yyklnugzchpznjzlwxnt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5a2xudWd6Y2hwem5qemx3eG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDc1NDQsImV4cCI6MjA2OTE4MzU0NH0.3M1CtTBGW4zLtzWTFKNlPiJykfAVD8FetWS5GSwN8FY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Contact type definition
export interface Contact {
  id?: number
  district: string
  position: string
  name: string
  telephone: string
  number: string
  created_at?: string
  updated_at?: string
}

// Contact operations
export const contactService = {
  // Get all contacts
  async getContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get contact by ID
  async getContact(id: number) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new contact
  async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update contact
  async updateContact(id: number, contact: Partial<Contact>) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete contact
  async deleteContact(id: number) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Delete multiple contacts
  async deleteContacts(ids: number[]) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .in('id', ids)
    
    if (error) throw error
  },

  // Search contacts
  async searchContacts(searchTerm: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,telephone.ilike.%${searchTerm}%,number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Filter contacts by district and position
  async filterContacts(district?: string, position?: string) {
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (district && district !== 'All Districts') {
      query = query.eq('district', district)
    }
    
    if (position && position !== 'All Positions') {
      query = query.eq('position', position)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }
} 