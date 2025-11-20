"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search as SearchIcon } from "lucide-react"

interface SearchableDropdownProps {
  options: { id: string; name: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  className = ""
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
    }
  }, [isOpen])

  // Find the selected option name for display
  const selectedOption = options.find(option => option.id === value)?.name || value

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown trigger */}
      <div
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? selectedOption : placeholder}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                    value === option.id ? "bg-orange-100" : ""
                  }`}
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                  }}
                >
                  {option.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}