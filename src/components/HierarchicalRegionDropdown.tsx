import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authService } from '@/api/services'
import type { RegionDetails } from '@/types'

interface HierarchicalRegionDropdownProps {
  onRegionChange: (regionId: number, regionName: string, regionType: string) => void
  disabled?: boolean
  userRole?: 'ADMIN' | 'PRANT_KARYAKARTA' | 'VIBHAG_KARYAKARTA' | 'JILA_KARYAKARTA' | 'NAGAR_KARYAKARTA'
}

// Define the region hierarchy options
const REGION_OPTIONS = [
  { value: 'prant', label: 'प्रांत', type: 'PRANT' },
  { value: 'vibhag', label: 'विभाग', type: 'VIBHAG' },
  { value: 'jila', label: 'जिला', type: 'JILA' },
  { value: 'nagar', label: 'नगर', type: 'NAGAR' }
]

export default function HierarchicalRegionDropdown({ onRegionChange, disabled = false, userRole }: HierarchicalRegionDropdownProps) {
  const [selectedRegionType, setSelectedRegionType] = useState<string>('')
  const [availableOptions, setAvailableOptions] = useState<typeof REGION_OPTIONS>([])
  const [isLoading, setIsLoading] = useState(true)
  const [regionLabel, setRegionLabel] = useState('')

  // Initialize and determine available region types based on user's level or provided role
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        
        let optionsToShow: typeof REGION_OPTIONS = []
        let label = ''

        // If userRole is provided (from CreatePage), use that to determine available options
        if (userRole) {
          switch (userRole) {
            case 'PRANT_KARYAKARTA':
              // Prant level can select vibhag, jila, nagar
              optionsToShow = REGION_OPTIONS.filter(option => 
                ['vibhag', 'jila', 'nagar'].includes(option.value)
              )
              label = 'विभाग, जिला, नगर चुनें'
              break
            case 'VIBHAG_KARYAKARTA':
              // Vibhag level can select jila, nagar
              optionsToShow = REGION_OPTIONS.filter(option => 
                ['jila', 'nagar'].includes(option.value)
              )
              label = 'जिला, नगर चुनें'
              break
            case 'JILA_KARYAKARTA':
              // Jila level can select nagar
              optionsToShow = REGION_OPTIONS.filter(option => 
                ['nagar'].includes(option.value)
              )
              label = 'नगर चुनें'
              break
            case 'NAGAR_KARYAKARTA':
              // Nagar level cannot select anything lower
              optionsToShow = []
              label = 'कोई विकल्प उपलब्ध नहीं है'
              break
            default:
              // Default case - show all region types
              optionsToShow = REGION_OPTIONS
              label = 'क्षेत्र प्रकार चुनें'
          }
        } else {
          // Fallback to current user's level (original behavior)
          const response = await authService.getCurrentUser()
          if (!response.success || !response.data) {
            console.error('Failed to get current user')
            return
          }

          const regionDetails: RegionDetails | null | undefined = response.data.region_details
          console.log('User region details:', regionDetails)

          // Check what level the user is at and what they can select
          if (regionDetails?.prant && !regionDetails?.vibhag) {
            // User is at prant level, can select vibhag, jila, nagar
            optionsToShow = REGION_OPTIONS.filter(option => 
              ['vibhag', 'jila', 'nagar'].includes(option.value)
            )
            label = 'विभाग, जिला, नगर चुनें'
          } else if (regionDetails?.vibhag && !regionDetails?.jila) {
            // User is at vibhag level, can select jila, nagar
            optionsToShow = REGION_OPTIONS.filter(option => 
              ['jila', 'nagar'].includes(option.value)
            )
            label = 'जिला, नगर चुनें'
          } else if (regionDetails?.jila && !regionDetails?.nagar) {
            // User is at jila level, can select nagar
            optionsToShow = REGION_OPTIONS.filter(option => 
              ['nagar'].includes(option.value)
            )
            label = 'नगर चुनें'
          } else if (regionDetails?.nagar) {
            // User is at nagar level, cannot select anything lower
            optionsToShow = []
            label = 'कोई विकल्प उपलब्ध नहीं है'
          } else {
            // Default case - show all region types
            optionsToShow = REGION_OPTIONS
            label = 'क्षेत्र प्रकार चुनें'
          }
        }

        setAvailableOptions(optionsToShow)
        setRegionLabel(label)

        console.log('Available region options:', optionsToShow)
        console.log('Region label:', label)

        // Auto-select first option if available
        if (optionsToShow.length > 0) {
          const firstOption = optionsToShow[0]
          setSelectedRegionType(firstOption.value)
          onRegionChange(0, firstOption.label, firstOption.type) // Using 0 as placeholder ID
          console.log('Auto-selected region type:', firstOption)
        }

      } catch (err) {
        console.error('Error initializing hierarchical regions:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [userRole])

  const handleRegionTypeChange = (value: string) => {
    const selectedOption = availableOptions.find(option => option.value === value)
    if (selectedOption) {
      setSelectedRegionType(value)
      onRegionChange(0, selectedOption.label, selectedOption.type) // Using 0 as placeholder ID
      console.log('Selected region type:', selectedOption)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{regionLabel}</Label>
      <Select
        value={selectedRegionType}
        onValueChange={handleRegionTypeChange}
        disabled={disabled || isLoading || availableOptions.length === 0}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={
              isLoading 
                ? "लोड हो रहा है..." 
                : availableOptions.length === 0 
                  ? "कोई विकल्प उपलब्ध नहीं है"
                  : "क्षेत्र प्रकार चुनें"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}