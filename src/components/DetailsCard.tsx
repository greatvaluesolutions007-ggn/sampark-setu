import { ChevronRight } from 'lucide-react'
import type { SummaryItem } from '@/types'

interface HierarchyLevel {
  level: number
  regionId: number
  regionName: string
  regionType: string
  data: SummaryItem[]
  isExpanded: boolean
  isLoading: boolean
}

export interface DetailsCardData {
  hierarchyLevels: HierarchyLevel[]
  dataType: 'toli' | 'parivar' | 'utsuk'
  getRegionTypeLabel: (keyName: string) => string
  getTotalCount: (level: HierarchyLevel) => number
  getCardColor: () => string
}

type DetailsCardProps = DetailsCardData

export default function DetailsCard({ 
  hierarchyLevels, 
  dataType, 
  getRegionTypeLabel, 
  getTotalCount, 
  getCardColor 
}: DetailsCardProps) {
  if (hierarchyLevels.length === 0) return null

  const currentLevel = hierarchyLevels[hierarchyLevels.length - 1]
  const topLevel = hierarchyLevels[0]

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      {/* Navigation Path */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <span className="font-medium">नेविगेशन पथ:</span>
        {hierarchyLevels.map((level, index) => (
          <div key={level.level} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />}
            <span className="text-primary font-medium">
              {getRegionTypeLabel(level.regionType)}: {level.regionName}
            </span>
          </div>
        ))}
      </div>
      
      {/* Current Level Details and Total */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentLevel.regionName}
            </h4>
            <p className="text-sm text-gray-500">
              {getRegionTypeLabel(currentLevel.regionType)}
            </p>
          </div>
          <div className="text-right">
            {dataType === 'parivar' ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-600">
                  {currentLevel.data.reduce((sum, item) => sum + (item.total_families || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">परिवार</div>
                <div className="text-xs text-gray-400 flex flex-wrap gap-x-2">
                  {currentLevel.data.some(item => item.total_contacted) && (
                    <span className="text-blue-600">
                      संपर्कित: {currentLevel.data.reduce((sum, item) => sum + (item.total_contacted || 0), 0)}
                    </span>
                  )}
                  {currentLevel.data.some(item => item.male_count) && (
                    <span>
                      पुरुष: {currentLevel.data.reduce((sum, item) => sum + parseInt(item.male_count || '0'), 0)}
                    </span>
                  )}
                  {currentLevel.data.some(item => item.female_count) && (
                    <span>
                      महिला: {currentLevel.data.reduce((sum, item) => sum + parseInt(item.female_count || '0'), 0)}
                    </span>
                  )}
                  {currentLevel.data.some(item => item.kids_count) && (
                    <span>
                      बच्चे: {currentLevel.data.reduce((sum, item) => sum + parseInt(item.kids_count || '0'), 0)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className={`text-lg font-bold ${getCardColor()}`}>
                  {getTotalCount(currentLevel)}
                </div>
                <div className="text-xs text-gray-500">
                  {dataType === 'toli' ? 'टोलिया' : 'उत्सुक शक्ति'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Top Level Total - Only show when there are multiple levels */}
        {hierarchyLevels.length > 1 && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {topLevel.regionName}
                </h4>
                <p className="text-sm text-gray-500">
                  {getRegionTypeLabel(topLevel.regionType)} - कुल योग
                </p>
              </div>
              <div className="text-right">
                {dataType === 'parivar' ? (
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      {topLevel.data.reduce((sum, item) => sum + (item.total_families || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-500">कुल परिवार</div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-2">
                      {topLevel.data.some(item => item.total_contacted) && (
                        <span className="text-blue-600">
                          संपर्कित: {topLevel.data.reduce((sum, item) => sum + (item.total_contacted || 0), 0)}
                        </span>
                      )}
                      {topLevel.data.some(item => item.male_count) && (
                        <span>
                          पुरुष: {topLevel.data.reduce((sum, item) => sum + parseInt(item.male_count || '0'), 0)}
                        </span>
                      )}
                      {topLevel.data.some(item => item.female_count) && (
                        <span>
                          महिला: {topLevel.data.reduce((sum, item) => sum + parseInt(item.female_count || '0'), 0)}
                        </span>
                      )}
                      {topLevel.data.some(item => item.kids_count) && (
                        <span>
                          बच्चे: {topLevel.data.reduce((sum, item) => sum + parseInt(item.kids_count || '0'), 0)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={`text-lg font-bold ${getCardColor()}`}>
                      {getTotalCount(topLevel)}
                    </div>
                    <div className="text-xs text-gray-500">
                      कुल {dataType === 'toli' ? 'टोलिया' : 'उत्सुक शक्ति'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
