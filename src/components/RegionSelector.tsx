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
  readOnly?: boolean
}

// Cache for child regions to avoid redundant API calls
const regionCache = new Map<number, { vibhag: RegionType[], jila: RegionType[], nagar: RegionType[] }>()

// Fetch child regions helper with caching
const fetchChildRegions = async (regionId: number) => {
  // Check cache first
  if (regionCache.has(regionId)) {
    return regionCache.get(regionId)!
  }

  try {
    const resp = await regionService.fetchRegions(regionId)
    const result = {
      vibhag: resp?.data?.child_regions?.vibhag ?? [],
      jila: resp?.data?.child_regions?.jila ?? [],
      nagar: resp?.data?.child_regions?.nagar ?? []
    }
    
    // Cache the result
    regionCache.set(regionId, result)
    return result
  } catch (e) {
    console.error('Failed to fetch child regions', e)
    const emptyResult = { vibhag: [], jila: [], nagar: [] }
    regionCache.set(regionId, emptyResult)
    return emptyResult
  }
}

export default function RegionSelector({ onRegionChange, disabled = false, readOnly = false }: RegionSelectorProps) {
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

  // Memoized user data to prevent refetching
  const [userData, setUserData] = useState<{
    regionDetails: RegionDetails | null
    regionId: number | null
  } | null>(null)



  // Initialize - Load user data and setup regions (only once)
  useEffect(() => {
    const init = async () => {
      // Skip if already initialized or user data is available
      if (isInitialized || userData) return

      try {
        setIsLoading(true)
        const response = await authService.getCurrentUser()
        if (!response.success || !response.data) {
          console.error('Failed to get current user')
          return
        }

        const rd: RegionDetails | null | undefined = response.data.region_details
        const userId = response.data.region_id ?? null
        
        // Store user data to prevent refetching
        setUserData({ regionDetails: rd || null, regionId: userId })
        
        // Fetch options for non-assigned levels
        if (!userId) return

        // Set assigned regions
        const assignedPrant = rd?.prant ??null
        const assignedVibhag = rd?.vibhag ??null
        const assignedJila = rd?.jila ?? null
        const assignedNagar = rd?.nagar ?? null

        setPrantAssigned(assignedPrant)
        setVibhagAssigned(assignedVibhag)
        setJilaAssigned(assignedJila)
        setNagarAssigned(assignedNagar)
        setUserRegionId(userId)
        
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
  }, [isInitialized, userData])


  // Notify parent when regions change (memoized to prevent excessive calls)
  useEffect(() => {
    if (isInitialized) {
      onRegionChange(prant, vibhag, jila, nagar)
    }
  }, [prant, vibhag, jila, nagar, isInitialized, onRegionChange])

  // Memoized handlers to prevent unnecessary re-renders and API calls
  const handleVibhagChange = useCallback(async (value: string) => {
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
  }, [userRegionId])

  const handleJilaChange = useCallback(async (value: string) => {
    setJila(value)
    setNagar('')

    if (userRegionId) {
      const childRegions = await fetchChildRegions(userRegionId)
      setNagarOptions(childRegions.nagar)

      if (childRegions.nagar.length > 0) {
        setNagar(childRegions.nagar[0].id.toString())
      }
    }
  }, [userRegionId])

  const handleNagarChange = useCallback((value: string) => {
    setNagar(value)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      {readOnly && (
        <div className="col-span-2 mb-2">
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
            📍 क्षेत्र की जानकारी आपके पंजीकरण से ली गई है और इसे बदला नहीं जा सकता।
          </p>
        </div>
      )}
      <div>
        <Label>प्रांत</Label>
        <Select
          value={prantAssigned ? prantAssigned.region_id.toString() : prant}
          onValueChange={() => { }}
          disabled={true}
        >
          <SelectTrigger className={readOnly ? "bg-gray-100 cursor-not-allowed" : ""}>
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
          disabled={readOnly || disabled || isLoading || !!vibhagAssigned || vibhagOptions.length === 0}
        >
          <SelectTrigger className={readOnly ? "bg-gray-100 cursor-not-allowed" : ""}>
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
          disabled={readOnly || disabled || isLoading || !!jilaAssigned || jilaOptions.length === 0}
        >
          <SelectTrigger className={readOnly ? "bg-gray-100 cursor-not-allowed" : ""}>
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
          disabled={readOnly || disabled || isLoading || !!nagarAssigned || nagarOptions.length === 0}
        >
          <SelectTrigger className={readOnly ? "bg-gray-100 cursor-not-allowed" : ""}>
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