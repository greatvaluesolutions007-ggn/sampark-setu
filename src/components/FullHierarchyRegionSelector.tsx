import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { authService, regionService } from '@/api/services'
import type { RegionHierarchy, Region } from '@/types'

interface FullHierarchyRegionSelectorProps {
  onRegionChange?: (regionId: number, regionName: string, regionType: string) => void
  disabled?: boolean
  refreshKey?: string | number // Optional prop to force refresh when user changes
}

export default function FullHierarchyRegionSelector({ 
  onRegionChange,
  disabled = false,
  refreshKey
}: FullHierarchyRegionSelectorProps) {
  const [hierarchy, setHierarchy] = useState<RegionHierarchy>({
    prant: null,
    vibhag: null,
    jila: null,
    nagar: null,
    khand: null,
    basti: null,
    mandal: null,
    gram: null
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [pathType, setPathType] = useState<'GRAMNIYE' | 'NAGARIYE' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserHierarchy()
  }, [refreshKey]) // Re-run when refreshKey changes (e.g., when user changes)

  const loadUserHierarchy = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Reset hierarchy first to ensure clean state
      setHierarchy({
        prant: null,
        vibhag: null,
        jila: null,
        nagar: null,
        khand: null,
        basti: null,
        mandal: null,
        gram: null
      })
      setPathType(null)
      
      // Get current user - the API already returns complete region_details
      const userResponse = await authService.getCurrentUser()
      
      if (!userResponse.success || !userResponse.data) {
        setError('उपयोगकर्ता की जानकारी प्राप्त करने में त्रुटि')
        console.error('Failed to get current user:', userResponse)
        return
      }

      console.log('User data:', userResponse.data)
      console.log('User name:', userResponse.data.user_name)
      console.log('User region_id:', userResponse.data.region_id)
      
      // Extract region_details which already contains the complete hierarchy
      const regionDetails = userResponse.data.region_details
      console.log('Region details from user API:', regionDetails)
      
      if (!regionDetails) {
        setError('क्षेत्र की जानकारी उपलब्ध नहीं है')
        return
      }

      // Use the hierarchy directly from user API response
      const regionHierarchy = {
        prant: regionDetails.prant || null,
        vibhag: regionDetails.vibhag || null,
        jila: regionDetails.jila || null,
        nagar: regionDetails.nagar || null,
        khand: regionDetails.khand || null,
        basti: regionDetails.basti || null,
        mandal: regionDetails.mandal || null,
        gram: regionDetails.gram || null
      }

      console.log('Built hierarchy from user API:', regionHierarchy)
      setHierarchy(regionHierarchy)

      // Determine path type based on region hierarchy
      let detectedPathType = null
      if (regionHierarchy.nagar || regionHierarchy.basti) {
        detectedPathType = 'NAGARIYE'
      } else if (regionHierarchy.khand || regionHierarchy.mandal || regionHierarchy.gram) {
        detectedPathType = 'GRAMNIYE'
      }
      
      setPathType(detectedPathType)
      console.log('Detected path type:', detectedPathType)

      // Call onRegionChange with the most specific region available
      const mostSpecificRegion = 
        regionHierarchy.gram || 
        regionHierarchy.basti || 
        regionHierarchy.mandal || 
        regionHierarchy.nagar || 
        regionHierarchy.khand || 
        regionHierarchy.jila || 
        regionHierarchy.vibhag || 
        regionHierarchy.prant

      if (mostSpecificRegion && onRegionChange) {
        console.log('Calling onRegionChange with:', mostSpecificRegion)
        onRegionChange(mostSpecificRegion.region_id, mostSpecificRegion.name, mostSpecificRegion.type)
      }

    } catch (err) {
      console.error('Error loading user hierarchy:', err)
      
      // More detailed error logging
      if (err instanceof Error) {
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
      }
      
      // Check if it's an API error
      if ((err as any)?.response) {
        console.error('API Error Response:', (err as any).response)
        console.error('API Error Status:', (err as any).response?.status)
        console.error('API Error Data:', (err as any).response?.data)
      }
      
      setError('क्षेत्र की जानकारी लोड करने में त्रुटि')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <p className="text-gray-600">क्षेत्र की जानकारी लोड हो रही है...</p>
        </div>
      </div>
    )
  }

  // Don't return early on error - show error but still display fields

  const getDisplayValue = (region: Region | null) => region?.name || ''

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-1">कृपया नीचे दिए गए फ़ील्ड देखें - ये आपके क्षेत्र की जानकारी दिखाने के लिए हैं</p>
        </div>
      )}

      {/* Information Banner */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 mt-0.5">📍</span>
          <div>
            <p className="text-blue-800 font-medium text-sm">
              क्षेत्र की जानकारी आपके पंजीकरण से ली गई है
            </p>
            <p className="text-blue-700 text-xs mt-1">
              यह जानकारी बदली नहीं जा सकती और टोली इसी क्षेत्र में बनाई जाएगी
            </p>
          </div>
        </div>
      </div> */}


      {/* Hierarchy Display - Show fields with data, or fallback fields if error */}
      <div className="grid grid-cols-2 gap-4">
        {/* प्रांत - Show if data exists OR if there's an error (as fallback) */}
        {(hierarchy.prant || error) && (
          <div>
            <Label>प्रांत</Label>
            <Select disabled={true} value={hierarchy.prant?.region_id.toString() || ''}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder={hierarchy.prant?.name || "प्रांत लोड नहीं हो सका"} />
              </SelectTrigger>
              <SelectContent>
                {hierarchy.prant && (
                  <SelectItem value={hierarchy.prant.region_id.toString()}>
                    {hierarchy.prant.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* विभाग - Show if data exists OR if there's an error (as fallback) */}
        {(hierarchy.vibhag || error) && (
          <div>
            <Label>विभाग</Label>
            <Select disabled={true} value={hierarchy.vibhag?.region_id.toString() || ''}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder={hierarchy.vibhag?.name || "विभाग लोड नहीं हो सका"} />
              </SelectTrigger>
              <SelectContent>
                {hierarchy.vibhag && (
                  <SelectItem value={hierarchy.vibhag.region_id.toString()}>
                    {hierarchy.vibhag.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* जिला - Show if data exists OR if there's an error (as fallback) */}
        {(hierarchy.jila || error) && (
          <div>
            <Label>जिला</Label>
            <Select disabled={true} value={hierarchy.jila?.region_id.toString() || ''}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder={hierarchy.jila?.name || "जिला लोड नहीं हो सका"} />
              </SelectTrigger>
              <SelectContent>
                {hierarchy.jila && (
                  <SelectItem value={hierarchy.jila.region_id.toString()}>
                    {hierarchy.jila.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* प्रकार - Show if pathType is determined OR if there's an error */}
        {(pathType || error) && (
          <div>
            <Label>प्रकार</Label>
            <Select disabled={true} value={pathType || ''}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder={pathType ? (pathType === 'GRAMNIYE' ? 'ग्रामीय' : 'नागरिक') : "प्रकार लोड नहीं हो सका"} />
              </SelectTrigger>
              <SelectContent>
                {pathType && (
                  <SelectItem value={pathType}>
                    {pathType === 'GRAMNIYE' ? 'ग्रामीय' : 'नागरिक'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* खंड - Show only if data exists (Gramniye path) */}
        {hierarchy.khand && (
          <div>
            <Label>खंड</Label>
            <Select disabled={true} value={hierarchy.khand.region_id.toString()}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="खंड" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={hierarchy.khand.region_id.toString()}>
                  {hierarchy.khand.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* नगर - Show only if data exists (Nagariye path) */}
        {hierarchy.nagar && (
          <div>
            <Label>नगर</Label>
            <Select disabled={true} value={hierarchy.nagar.region_id.toString()}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="नगर" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={hierarchy.nagar.region_id.toString()}>
                  {hierarchy.nagar.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* मंडल - Show only if data exists (Gramniye path) */}
        {hierarchy.mandal && (
          <div>
            <Label>मंडल</Label>
            <Select disabled={true} value={hierarchy.mandal.region_id.toString()}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="मंडल" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={hierarchy.mandal.region_id.toString()}>
                  {hierarchy.mandal.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* बस्ती - Show only if data exists (Nagariye path) */}
        {hierarchy.basti && (
          <div>
            <Label>बस्ती</Label>
            <Select disabled={true} value={hierarchy.basti.region_id.toString()}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="बस्ती" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={hierarchy.basti.region_id.toString()}>
                  {hierarchy.basti.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ग्राम - Show only if data exists (Gramniye path) */}
        {hierarchy.gram && (
          <div className="col-span-2">
            <Label>ग्राम</Label>
            <Select disabled={true} value={hierarchy.gram.region_id.toString()}>
              <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                <SelectValue placeholder="ग्राम" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={hierarchy.gram.region_id.toString()}>
                  {hierarchy.gram.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

    </div>
  )
}
