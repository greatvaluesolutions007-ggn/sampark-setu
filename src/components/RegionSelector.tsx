import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { regionService } from '@/api/services'
import type { Region, RegionData } from '@/types'

interface RegionSelectorProps {
  onRegionChange: (prant: string, vibhag: string, jila: string, nagar: string) => void
  initialValues?: {
    prant?: string
    vibhag?: string
    jila?: string
    nagar?: string
  }
  regionDetails?: RegionData,
  disabled?: boolean
}

export default function RegionSelector({ onRegionChange, initialValues, disabled = false, regionDetails }: RegionSelectorProps) {
  const [prant, setPrant] = useState(initialValues?.prant || '')
  const [vibhag, setVibhag] = useState(initialValues?.vibhag || '')
  const [jila, setJila] = useState(initialValues?.jila || '')
  const [nagar, setNagar] = useState(initialValues?.nagar || '')

  // For prant, load from API; for others, use passed regionDetails
  const [prantOptions, setPrantOptions] = useState<Region[]>([])
  const [isLoadingPrant, setIsLoadingPrant] = useState(false)
  
  const vibhagOptions = regionDetails?.child_regions?.vibhag || []
  const jilaOptions = regionDetails?.child_regions?.jila || []
  const nagarOptions = regionDetails?.child_regions?.nagar || []

  // Load PRANT regions on component mount
  useEffect(() => {
    loadPrantRegions()
  }, [])

  const loadPrantRegions = async () => {
    try {
      setIsLoadingPrant(true)
      const response = await regionService.getRegions('PRANT')
      if (response.success) {
        setPrantOptions(response.data)
        // Set first value as default if no initial value and no current selection
        if (!initialValues?.prant && !prant && response.data.length > 0) {
          setPrant(response.data[0].region_id.toString())
        }
      }
    } catch (err) {
      console.error('Error loading prant regions:', err)
    } finally {
      setIsLoadingPrant(false)
    }
  }

  // Update state when initialValues change
  useEffect(() => {
    if (initialValues) {
      setPrant(initialValues.prant || '')
      setVibhag(initialValues.vibhag || '')
      setJila(initialValues.jila || '')
      setNagar(initialValues.nagar || '')
    }
  }, [initialValues])

  // Set default values for other dropdowns when regionDetails change
  useEffect(() => {
    if (regionDetails && !initialValues) {
      // Set first vibhag as default if no initial value and no current selection
      if (!vibhag && vibhagOptions.length > 0) {
        setVibhag(vibhagOptions[0].id.toString())
      }
      // Set first jila as default if no initial value and no current selection
      if (!jila && jilaOptions.length > 0) {
        setJila(jilaOptions[0].id.toString())
      }
      // Set first nagar as default if no initial value and no current selection
      if (!nagar && nagarOptions.length > 0) {
        setNagar(nagarOptions[0].id.toString())
      }
    }
  }, [regionDetails, vibhagOptions, jilaOptions, nagarOptions])

  // Notify parent component when any region changes
  useEffect(() => {
    onRegionChange(prant, vibhag, jila, nagar)
  }, [prant, vibhag, jila, nagar, onRegionChange])

  const handlePrantChange = (value: string) => {
    setPrant(value)
  }

  const handleVibhagChange = (value: string) => {
    setVibhag(value)
  }

  const handleJilaChange = (value: string) => {
    setJila(value)
  }

  const handleNagarChange = (value: string) => {
    setNagar(value)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>प्रांत</Label>
        <Select 
          value={prant} 
          onValueChange={handlePrantChange}
          disabled={disabled || isLoadingPrant || prantOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingPrant ? "लोड हो रहा है..." : "प्रांत चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {prantOptions.map((p) => (
              <SelectItem key={p.region_id} value={p.region_id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>विभाग</Label>
        <Select 
          value={vibhag} 
          onValueChange={handleVibhagChange}
          disabled={disabled || vibhagOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="विभाग चुनें" />
          </SelectTrigger>
          <SelectContent>
            {vibhagOptions.map((v) => (
              <SelectItem key={v.id} value={v.id.toString()}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>जिला</Label>
        <Select 
          value={jila} 
          onValueChange={handleJilaChange}
          disabled={disabled || jilaOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="जिला चुनें" />
          </SelectTrigger>
          <SelectContent>
            {jilaOptions.map((j) => (
              <SelectItem key={j.id} value={j.id.toString()}>
                {j.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>नगर/खंड</Label>
        <Select 
          value={nagar} 
          onValueChange={handleNagarChange}
          disabled={disabled || nagarOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="नगर/खंड चुनें" />
          </SelectTrigger>
          <SelectContent>
            {nagarOptions.map((n) => (
              <SelectItem key={n.id} value={n.id.toString()}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}