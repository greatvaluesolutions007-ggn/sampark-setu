import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authService, regionService } from '@/api/services'
import type { Region, RegionDetails, RegionType, RegionData } from '@/types'

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

// Fetch child regions helper
const fetchChildRegions = async (regionId: number) => {
  try {
    const resp = await regionService.fetchRegions(regionId)
    return {
      vibhag: resp?.data?.child_regions?.vibhag ?? [],
      jila: resp?.data?.child_regions?.jila ?? [],
      nagar: resp?.data?.child_regions?.nagar ?? []
    }
  } catch (e) {
    console.error('Failed to fetch child regions', e)
    return { vibhag: [], jila: [], nagar: [] }
  }
}

export default function RegionSelector({ onRegionChange, initialValues, disabled = false }: RegionSelectorProps) {
  const [prant, setPrant] = useState('')
  const [vibhag, setVibhag] = useState('')
  const [jila, setJila] = useState('')
  const [nagar, setNagar] = useState('')

  // Assigned regions (single objects, not selectable)
  const [prantAssigned, setPrantAssigned] = useState<Region | null>(null)
  const [vibhagAssigned, setVibhagAssigned] = useState<Region | null>(null)
  const [jilaAssigned, setJilaAssigned] = useState<Region | null>(null)
  const [nagarAssigned, setNagarAssigned] = useState<Region | null>(null)

  // Options for selectable levels
  const [vibhagOptions, setVibhagOptions] = useState<RegionType[]>([])
  const [jilaOptions, setJilaOptions] = useState<RegionType[]>([])
  const [nagarOptions, setNagarOptions] = useState<RegionType[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [userRegionId, setUserRegionId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)



  // Initialize - Load user data and setup regions
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true)
        const response = await authService.getCurrentUser()
        if (!response.success || !response.data) {
          console.error('Failed to get current user')
          return
        }

        const rd: RegionDetails | null | undefined = response.data.region_details
        const userId = response.data.region_id ?? null
        // Fetch options for non-assigned levels
        if (!userId) return

        // Set assigned regions
        const assignedPrant = rd?.prant ?? {
          "region_id": 2,
          "name": "गुरुग्राम",
          "code": "GGM",
          "type": "JILA"
        }
        const assignedVibhag = rd?.vibhag ?? {
          "region_id": 2,
          "name": "गुरुग्राम",
          "code": "GGM",
          "type": "JILA"
        }
        const assignedJila = rd?.jila ?? null
        const assignedNagar = rd?.nagar ?? null

        setPrantAssigned(assignedPrant)
        setVibhagAssigned(assignedVibhag)
        setJilaAssigned(assignedJila)
        setNagarAssigned(assignedNagar)
        setUserRegionId(userId)
        console.log(assignedJila, assignedNagar, assignedVibhag, assignedPrant, userId)
        // Set values for assigned levels
        if (assignedPrant) setPrant(assignedPrant.region_id.toString())
        if (assignedVibhag) setVibhag(assignedVibhag.region_id.toString())
        if (assignedJila) setJila(assignedJila.region_id.toString())
        if (assignedNagar) setNagar(assignedNagar.region_id.toString())



        const childRegions = await fetchChildRegions(userId)

        // Determine what needs to be loaded and auto-selected
        if (!assignedNagar && assignedJila) {
          // Only nagar is selectable
          setNagarOptions(childRegions.nagar)
          if (childRegions.nagar.length > 0) {
            setNagar(childRegions.nagar[0].id.toString())
          }
        } else if (!assignedJila && assignedVibhag) {
          // Jila and nagar are selectable
          setJilaOptions(childRegions.jila)
          setNagarOptions(childRegions.nagar)
          if (childRegions.jila.length > 0) {
            setJila(childRegions.jila[0].id.toString())
          }
          if (childRegions.nagar.length > 0) {
            setNagar(childRegions.nagar[0].id.toString())
          }
        } else if (!assignedVibhag && assignedPrant) {
          // Vibhag, jila, and nagar are selectable
          setVibhagOptions(childRegions.vibhag)
          setJilaOptions(childRegions.jila)
          setNagarOptions(childRegions.nagar)
          if (childRegions.vibhag.length > 0) {
            setVibhag(childRegions.vibhag[0].id.toString())
          }
          if (childRegions.jila.length > 0) {
            setJila(childRegions.jila[0].id.toString())
          }
          if (childRegions.nagar.length > 0) {
            setNagar(childRegions.nagar[0].id.toString())
          }
        }

        setIsInitialized(true)
      } catch (err) {
        console.error('Error initializing regions:', err)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])


  // Notify parent when regions change
  // useEffect(() => {
  //   if (isInitialized) {
  //     onRegionChange(prant, vibhag, jila, nagar)
  //   }
  // }, [prant, vibhag, jila, nagar, isInitialized, onRegionChange])

  // Handlers
  const handleVibhagChange = async (value: string) => {
    onRegionChange(prant, value, jila, nagar)
    setVibhag(value)
    setJila('')
    setNagar('')

    if (userRegionId) {
      const childRegions = await fetchChildRegions(userRegionId)
      setJilaOptions(childRegions.jila)
      setNagarOptions(childRegions.nagar)

      if (childRegions.jila.length > 0) {
        setJila(childRegions.jila[0].id.toString())
      }
      if (childRegions.nagar.length > 0) {
        setNagar(childRegions.nagar[0].id.toString())
      }
    }
  }

  const handleJilaChange = async (value: string) => {
    onRegionChange(prant, vibhag, value, nagar)
    setJila(value)
    setNagar('')

    if (userRegionId) {
      const childRegions = await fetchChildRegions(userRegionId)
      setNagarOptions(childRegions.nagar)

      if (childRegions.nagar.length > 0) {
        setNagar(childRegions.nagar[0].id.toString())
      }
    }
  }

  const handleNagarChange = (value: string) => {
    onRegionChange(prant, vibhag, jila, value)
    setNagar(value)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>प्रांत</Label>
        <Select
          value={prantAssigned ? prantAssigned.region_id.toString() : prant}
          onValueChange={() => { }}
          disabled={true}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "लोड हो रहा है..." : "प्रांत चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {prantAssigned && (
              <SelectItem key={prantAssigned.region_id} value={prantAssigned.region_id.toString()}>
                {prantAssigned.name}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>विभाग</Label>
        <Select
          value={vibhagAssigned ? vibhagAssigned.region_id.toString() : vibhag}
          onValueChange={handleVibhagChange}
          disabled={disabled || isLoading || !!vibhagAssigned || vibhagOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "लोड हो रहा है..." : "विभाग चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {vibhagAssigned ? (
              <SelectItem key={vibhagAssigned.region_id} value={vibhagAssigned.region_id.toString()}>
                {vibhagAssigned.name}
              </SelectItem>
            ) : (
              vibhagOptions.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>जिला</Label>
        <Select
          value={jilaAssigned ? jilaAssigned.region_id.toString() : jila}
          onValueChange={handleJilaChange}
          disabled={disabled || isLoading || !!jilaAssigned || jilaOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "लोड हो रहा है..." : "जिला चुनें"} />
          </SelectTrigger>
          <SelectContent className='z-[999999]'>
            {jilaAssigned ? (
              <SelectItem key={jilaAssigned.region_id} value={jilaAssigned.region_id.toString()}>
                {jilaAssigned.name}
              </SelectItem>
            ) : (
              jilaOptions.map((j) => (
                <SelectItem key={j.id} value={j.id.toString()}>
                  {j.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>नगर/खंड</Label>
        <Select
          value={nagarAssigned ? nagarAssigned.region_id.toString() : nagar}
          onValueChange={handleNagarChange}
          disabled={disabled || isLoading || !!nagarAssigned || nagarOptions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "लोड हो रहा है..." : "नगर/खंड चुनें"} />
          </SelectTrigger>
          <SelectContent>
            {nagarAssigned ? (
              <SelectItem key={nagarAssigned.region_id} value={nagarAssigned.region_id.toString()}>
                {nagarAssigned.name}
              </SelectItem>
            ) : (
              nagarOptions.map((n) => (
                <SelectItem key={n.id} value={n.id.toString()}>
                  {n.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}