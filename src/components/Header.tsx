'use client'
import React from 'react'
import { Menu, MessageSquare, Users, BarChart3, LogOut } from 'lucide-react'
import { Link } from '@/lib/Link'

export default function Header() {
  return (
    <header className="bg-yellow-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">Campaign Manager</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/Dashboard" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors cursor-pointer">
              <BarChart3 size={18} className="mr-2" />
              Dashboard
            </Link>
            <Link to="/Contacts" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors cursor-pointer">
              <Users size={18} className="mr-2" />
              Contacts
            </Link>
            <Link to="/MessageComposer" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors cursor-pointer">
              <MessageSquare size={18} className="mr-2" />
              Send Message
            </Link>
          </nav>

          <div className="flex items-center">
            <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-yellow-400 transition-colors cursor-pointer">
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
            <button className="md:hidden ml-4 p-2 rounded-md text-gray-900 hover:bg-yellow-400 cursor-pointer">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}