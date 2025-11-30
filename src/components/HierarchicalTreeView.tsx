import { useEffect, useState, useCallback, useMemo } from 'react'
import { ChevronRight, Users, Home, UserCheck, BookOpen } from 'lucide-react'
import { reportingService } from '@/api/services'
import type { SummaryItem, User, HierarchicalSummaryResponse } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface HierarchicalTreeViewProps {
  user: User | null
  dataType: 'toli' | 'parivar' | 'utsuk' | 'sahitya'
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

interface HierarchyLevel {
  level: number
  regionId: number
  regionName: string
  regionType: string
  data: SummaryItem[]
  isExpanded: boolean
  isLoading: boolean
}

export default function HierarchicalTreeView({ user, dataType, onDetailsCardChange }: HierarchicalTreeViewProps) {
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([])
  const [selectedHierarchyPath, setSelectedHierarchyPath] = useState<number[]>([])
  const [shouldScrollToNewLevel, setShouldScrollToNewLevel] = useState(false)
  const orderedLevels = useMemo(() => {
    return [...hierarchyLevels].sort((a, b) => a.level - b.level)
  }, [hierarchyLevels])

  const getIcon = () => {
    switch (dataType) {
      case 'toli': return <Users className="h-5 w-5" />
      case 'parivar': return <Home className="h-5 w-5" />
      case 'utsuk': return <UserCheck className="h-5 w-5" />
      case 'sahitya': return <BookOpen className="h-5 w-5" />
    }
  }

  const getTitle = () => {
    switch (dataType) {
      case 'toli': return 'टोली जानकारी'
      case 'parivar': return 'परिवार जानकारी'
      case 'utsuk': return 'उत्सुक शक्ति (संघ कार्य से जुड़ने की इच्छा रखने वाले) जानकारी'
      case 'sahitya': return 'साहित्य वितरण जानकारी'
    }
  }

  const getRegionTypeLabel = useCallback((keyName: string) => {
    const labels: Record<string, string> = {
      'PRANT': 'प्रांत',
      'VIBHAG': 'विभाग',
      'JILA': 'जिला',
      'NAGAR': 'नगर',
      'KHAND': 'खंड',
      'BASTI': 'बस्ती',
      'MANDAL': 'मंडल',
      'GRAM': 'ग्राम'
    }
    return labels[keyName] || keyName
  }, [])

  const isClickable = (keyName: string) => {
    const k = String(keyName || '').toLowerCase();
    // Do not allow drilling down for lowest-level regions or for toli items
    if (k === 'basti' || k === 'gram' || k === 'बस्ती' || k === 'ग्राम') return false
    // Prevent clicking on toli items (these are user-specific aggregates)
    if (k === 'toli' || k === 'to li' || k === 'टोली' || k.includes('toli') || k.includes('टोली')) return false
    return true
  }

  const fetchDataForLevel = useCallback(async (regionId: number, level: number) => {
    try {
      console.log(`[${dataType}] Fetching data for level ${level}, regionId: ${regionId}`)
      
      setHierarchyLevels(prev => 
        prev.map(levelData => 
          levelData.level === level 
            ? { ...levelData, isLoading: true }
            : levelData
        )
      )

      let response: HierarchicalSummaryResponse
      switch (dataType) {
        case 'toli':
          response = await reportingService.getToliSummaryList(regionId)
          break
        case 'parivar':
          response = await reportingService.getParivarSummaryList(regionId)
          break
        case 'utsuk':
          response = await reportingService.getUtsukSummaryList(regionId)
          break
        case 'sahitya':
          response = await reportingService.getSahityaSummaryList(regionId)
          break
      }

      console.log(`[${dataType}] Response received:`, response)

      setHierarchyLevels(prev => 
        prev.map(levelData => 
          levelData.level === level 
            ? { 
                ...levelData, 
                data: response.data || [], 
                isLoading: false,
                isExpanded: true 
              }
            : levelData
        )
      )
    } catch (error) {
      console.error(`[${dataType}] Error fetching data:`, error)
      setHierarchyLevels(prev => 
        prev.map(levelData => 
          levelData.level === level 
            ? { ...levelData, isLoading: false, data: [] }
            : levelData
        )
      )
    }
  }, [dataType])

  const handleRegionClick = (regionId: number, regionName: string, regionType: string, level: number) => {
    if (!isClickable(regionType)) return
    
    // Build the hierarchy path up to the clicked level
    const newPath: number[] = []
    for (let i = 0; i <= level; i++) {
      if (hierarchyLevels[i]) {
        newPath.push(hierarchyLevels[i].regionId)
      }
    }
    newPath.push(regionId)
    setSelectedHierarchyPath(newPath)
    
    // Remove all levels below the clicked level
    setHierarchyLevels(prev => prev.filter(levelData => levelData.level <= level))
    
    // Add new level for the clicked region
    const newLevel: HierarchyLevel = {
      level: level + 1,
      regionId,
      regionName,
      regionType,
      data: [],
      isExpanded: false,
      isLoading: false
    }
    
    setHierarchyLevels(prev => [...prev, newLevel])
    
    // Set flag to scroll to new level after data loads
    setShouldScrollToNewLevel(true)
    
    // Fetch data for the new level
    fetchDataForLevel(regionId, level + 1)
  }

  const sanitizeNumber = (value: unknown): number => {
    const num = Number(value)
    return isNaN(num) ? 0 : Math.max(0, num)
  }

  const getTotalCount = useCallback((level: HierarchyLevel) => {
    switch (dataType) {
      case 'toli':
        return level.data.reduce((sum, item) => sum + sanitizeNumber(item.total_tolies || 0), 0)
      case 'parivar':
        return level.data.reduce((sum, item) => sum + sanitizeNumber(item.total_families || 0), 0)
      case 'utsuk':
        return level.data.reduce((sum, item) => sum + sanitizeNumber(item.utsuk_count || 0), 0)
      case 'sahitya':
        return level.data.reduce((sum, item) => sum + sanitizeNumber(item.sticker_count || 0) + sanitizeNumber(item.total_folder || 0) + sanitizeNumber(item.nishulk_books || 0) + sanitizeNumber(item.shashulk_books || 0), 0)
    }
  }, [dataType])

  const getCardValue = (item: SummaryItem) => {
    switch (dataType) {
      case 'toli':
        return sanitizeNumber(item.total_tolies || 0)
      case 'parivar':
        return sanitizeNumber(item.total_families || 0)
      case 'utsuk':
        return sanitizeNumber(item.utsuk_count || 0)
      case 'sahitya':
        return sanitizeNumber(item.sticker_count || 0) + sanitizeNumber(item.total_folder || 0) + sanitizeNumber(item.nishulk_books || 0) + sanitizeNumber(item.shashulk_books || 0)
    }
  }

  const getCardColor = useCallback(() => {
    switch (dataType) {
      case 'toli': return 'text-blue-600'
      case 'parivar': return 'text-green-600'
      case 'utsuk': return 'text-purple-600'
      case 'sahitya': return 'text-orange-600'
    }
  }, [dataType])

  const getSpinnerColor = () => {
    switch (dataType) {
      case 'toli': return 'border-blue-600'
      case 'parivar': return 'border-green-600'
      case 'utsuk': return 'border-purple-600'
      case 'sahitya': return 'border-orange-600'
    }
  }

  // Initialize with root level based on user's region_id
  useEffect(() => {
    if (!user?.region_id || !user?.region_details) {
      return
    }

    // Find which region matches the user's region_id
    const { region_details } = user
    let rootLevel: HierarchyLevel | null = null

    // Check each region type to find a match
    if (region_details.prant?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.prant.region_id,
        regionName: region_details.prant.name,
        regionType: 'PRANT',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.vibhag?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.vibhag.region_id,
        regionName: region_details.vibhag.name,
        regionType: 'VIBHAG',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.jila?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.jila.region_id,
        regionName: region_details.jila.name,
        regionType: 'JILA',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.nagar?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.nagar.region_id,
        regionName: region_details.nagar.name,
        regionType: 'NAGAR',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.khand?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.khand.region_id,
        regionName: region_details.khand.name,
        regionType: 'KHAND',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.mandal?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.mandal.region_id,
        regionName: region_details.mandal.name,
        regionType: 'MANDAL',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.gram?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.gram.region_id,
        regionName: region_details.gram.name,
        regionType: 'GRAM',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    } else if (region_details.basti?.region_id === user.region_id) {
      rootLevel = {
        level: 0,
        regionId: region_details.basti.region_id,
        regionName: region_details.basti.name,
        regionType: 'BASTI',
        data: [],
        isExpanded: false,
        isLoading: false
      }
    }

    if (rootLevel) {
      setHierarchyLevels([rootLevel])
      fetchDataForLevel(rootLevel.regionId, 0)
    }
  }, [user, fetchDataForLevel])

  // Auto-scroll effect when new levels are added
  useEffect(() => {
    if (shouldScrollToNewLevel && hierarchyLevels.length > 0) {
      const lastLevel = orderedLevels[orderedLevels.length - 1]
      if (lastLevel) {
        setTimeout(() => {
          const newLevelElement = document.querySelector(`[data-level="${lastLevel.level}"]`)
          if (newLevelElement) {
            newLevelElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            })
          }
          setShouldScrollToNewLevel(false)
        }, 200)
      }
    }
  }, [orderedLevels, shouldScrollToNewLevel, hierarchyLevels.length])

  // Notify parent when details card data changes
  useEffect(() => {
    if (onDetailsCardChange && orderedLevels.length > 0) {
      onDetailsCardChange({
        hierarchyLevels: orderedLevels,
        dataType,
        getRegionTypeLabel,
        getTotalCount,
        getCardColor
      })
    }
  }, [orderedLevels, dataType, onDetailsCardChange, getRegionTypeLabel, getTotalCount, getCardColor])

  return (
    <div className="space-y-6">
      {/* Loading/Empty State */}
      {orderedLevels.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">डेटा लोड हो रहा है...</div>
          <div className="text-sm text-gray-400">कृपया प्रतीक्षा करें</div>
        </div>
      )}

      {/* Hierarchy Levels */}
      {orderedLevels.map((level) => (
        <div key={level.level} className="space-y-4">
          {/* Level Header */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {Array.from({ length: level.level }, (_, i) => (
                <ChevronRight key={i} className="h-4 w-4 text-gray-400" />
              ))}
            </div>
            <h3 className="text-lg font-semibold flex items-center">
              {getIcon()}
              <span className="ml-2">{getTitle()} - {level.regionName} ({getRegionTypeLabel(level.regionType)})</span>
            </h3>
            {level.isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </div>

          {/* Level Data */}
            {level.data.length > 0 && (
            <div className={`grid grid-cols-1 gap-4 ${
              dataType === 'parivar' 
                ? 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {level.data.map((item, index) => (
                <div
                  key={`${level.level}-${index}`}
                  data-level={index ? null : level.level}
                  className={`${dataType === 'parivar' ? 'p-5' : 'p-4'} border rounded-lg transition-all duration-200 ${
                    isClickable(item.key_name)
                      ? `cursor-pointer hover:shadow-md hover:border-primary bg-white ${
                          level.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selectedHierarchyPath.includes(item.region_id) 
                            ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-md' 
                            : ''
                        }`
                      : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (isClickable(item.key_name) && !level.isLoading) {
                      handleRegionClick(item.region_id, item.value, item.key_name, level.level)
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      {selectedHierarchyPath.includes(item.region_id) && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.value}</h4>
                        <p className="text-sm text-gray-500">{getRegionTypeLabel(item.key_name)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {level.isLoading ? (
                        <div className="flex items-center justify-end">
                          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${getSpinnerColor()} mr-2`}></div>
                          <span className="text-sm text-gray-500">लोड हो रहा है...</span>
                        </div>
                      ) : (
                        <>
                          {dataType === 'parivar' ? (
                            <div className="space-y-0.5">
                              <div className={`text-xl font-bold ${getCardColor()}`}>
                                {getCardValue(item)}
                              </div>
                              <div className="text-xs text-gray-500">परिवार</div>
                              <div className="text-xs text-gray-400 flex flex-wrap gap-x-2">
                                {item.total_contacted !== undefined && (
                                  <span className="text-blue-600">संपर्कित: {item.total_contacted}</span>
                                )}
                                {item.male_count && (
                                  <span>पुरुष: {item.male_count}</span>
                                )}
                                {item.female_count && (
                                  <span>महिला: {item.female_count}</span>
                                )}
                                {item.kids_count && (
                                  <span>बच्चे: {item.kids_count}</span>
                                )}
                              </div>
                            </div>
                          ) : dataType === 'sahitya' ? (
                            <div className="space-y-0.5">
                              <div className={`text-xl font-bold ${getCardColor()}`}>
                                {getCardValue(item)}
                              </div>
                              <div className="text-xs text-gray-500">सामग्री कुल</div>
                              <div className="text-xs text-gray-400 flex flex-wrap gap-x-2">
                                <span>स्टीकर: {sanitizeNumber(item.sticker_count ?? 0)}</span>
                                <span>फोल्डर: {sanitizeNumber(item.total_folder ?? 0)}</span>
                                {/* निशुल्क field removed as requested */}
                                <span>सशुल्क: {sanitizeNumber(item.shashulk_books ?? 0)}</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`text-2xl font-bold ${getCardColor()}`}>
                                {getCardValue(item)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dataType === 'toli' ? 'टोलियाँ' : 'उत्सुक शक्ति'}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {!isClickable(item.key_name) && (
                    <div className="mt-2 text-xs text-gray-400 italic">
                      अंतिम स्तर - आगे नहीं जा सकते
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Data Message */}
          {!level.isLoading && level.data.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">इस क्षेत्र में कोई डेटा उपलब्ध नहीं है</div>
              <div className="text-sm text-gray-400">कृपया किसी अन्य क्षेत्र का चयन करें</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
