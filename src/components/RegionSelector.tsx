import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { regionService } from '@/api/services'
import type { Region } from '@/types'

interface RegionSelectorProps {
  onRegionChange: (prant: string, vibhag: string, jila: string, nagar: string) => void
  initialValues?: {
    prant?: string
    vibhag?: string
    jila?: string
    nagar?: string
  }
  disabled?: boolean
}

export default function RegionSelector({ onRegionChange, initialValues, disabled = false }: RegionSelectorProps) {
  const [prant, setPrant] = useState(initialValues?.prant || '')
  const [vibhag, setVibhag] = useState(initialValues?.vibhag || '')
  const [jila, setJila] = useState(initialValues?.jila || '')
  const [nagar, setNagar] = useState(initialValues?.nagar || '')

  const [prantOptions, setPrantOptions] = useState<Region[]>([])
  const [vibhagOptions, setVibhagOptions] = useState<Region[]>([])
  const [jilaOptions, setJilaOptions] = useState<Region[]>([])
  const [nagarOptions, setNagarOptions] = useState<Region[]>([])

  const [isLoadingPrant, setIsLoadingPrant] = useState(false)
  const [isLoadingVibhag, setIsLoadingVibhag] = useState(false)
  const [isLoadingJila, setIsLoadingJila] = useState(false)
  const [isLoadingNagar, setIsLoadingNagar] = useState(false)

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
      }
    } catch (err) {
      console.error('Error loading prant regions:', err)
    } finally {
      setIsLoadingPrant(false)
    }
  }

  // Load VIBHAG regions when prant is selected
  useEffect(() => {
    if (prant) {
      loadVibhagRegions(parseInt(prant))
    } else {
      setVibhagOptions([])
      setJilaOptions([])
      setNagarOptions([])
      setVibhag('')
      setJila('')
      setNagar('')
    }
  }, [prant])

  const loadVibhagRegions = async (prantId: number) => {
    try {
      setIsLoadingVibhag(true)
      const response = await regionService.getRegions('VIBHAG', prantId)
      if (response.success) {
        setVibhagOptions(response.data)
        setJilaOptions([])
        setNagarOptions([])
        setJila('')
        setNagar('')
      }
    } catch (err) {
      console.error('Error loading vibhag regions:', err)
    } finally {
      setIsLoadingVibhag(false)
    }
  }

  // Load JILA regions when vibhag is selected
  useEffect(() => {
    if (vibhag) {
      loadJilaRegions(parseInt(vibhag))
    } else {
      setJilaOptions([])
      setNagarOptions([])
      setJila('')
      setNagar('')
    }
  }, [vibhag])

  const loadJilaRegions = async (vibhagId: number) => {
    try {
      setIsLoadingJila(true)
      const response = await regionService.getRegions('JILA', vibhagId)
      if (response.success) {
        setJilaOptions(response.data)
        setNagarOptions([])
        setNagar('')
      }
    } catch (err) {
      console.error('Error loading jila regions:', err)
    } finally {
      setIsLoadingJila(false)
    }
  }

  // Load NAGAR regions when jila is selected
  useEffect(() => {
    if (jila) {
      loadNagarRegions(parseInt(jila))
    } else {
      setNagarOptions([])
      setNagar('')
    }
  }, [jila])

  const loadNagarRegions = async (jilaId: number) => {
    try {
      setIsLoadingNagar(true)
      const response = await regionService.getRegions('NAGAR', jilaId)
      if (response.success) {
        setNagarOptions(response.data)
      }
    } catch (err) {
      console.error('Error loading nagar regions:', err)
    } finally {
      setIsLoadingNagar(false)
    }
  }

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
          disabled={disabled || isLoadingPrant}
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
          disabled={!prant || disabled || isLoadingVibhag}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingVibhag ? "लोड हो रहा है..." : "विभाग चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {vibhagOptions.map((v) => (
              <SelectItem key={v.region_id} value={v.region_id.toString()}>
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
          disabled={!vibhag || disabled || isLoadingJila}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingJila ? "लोड हो रहा है..." : "जिला चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {jilaOptions.map((j) => (
              <SelectItem key={j.region_id} value={j.region_id.toString()}>
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
          disabled={!jila || disabled || isLoadingNagar}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingNagar ? "लोड हो रहा है..." : "नगर/खंड चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {nagarOptions.map((n) => (
              <SelectItem key={n.region_id} value={n.region_id.toString()}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
