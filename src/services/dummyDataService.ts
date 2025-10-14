import dummyData from '@/data/dummyData.json'

interface DummyDataResponse {
  success: boolean
  message: string
  statusCode: number
  data: any[]
}

interface RegionInfo {
  id: number
  name: string
  type: string
  parent_id: number | null
}

export class DummyDataService {
  private static getRegionData(regionId: number, dataType: 'toli' | 'parivar' | 'utsuk'): DummyDataResponse {
    const regionKey = regionId.toString()
    console.log('Looking for region:', regionKey, 'dataType:', dataType)
    const region = dummyData.regions[regionKey as keyof typeof dummyData.regions]
    console.log('Found region:', region)
    
    if (!region || !region.children || !region.children[dataType]) {
      console.log('No data found for region:', regionKey, 'dataType:', dataType)
      return {
        success: true,
        message: `${dataType} summary retrieved successfully`,
        statusCode: 200,
        data: []
      }
    }

    console.log('Returning data:', region.children[dataType])
    return {
      success: true,
      message: `${dataType} summary retrieved successfully`,
      statusCode: 200,
      data: region.children[dataType]
    }
  }

  static getRegionInfo(regionId: number): RegionInfo | null {
    const regionKey = regionId.toString()
    const region = dummyData.regions[regionKey as keyof typeof dummyData.regions]
    
    if (!region) {
      return null
    }

    return {
      id: regionId,
      name: region.name,
      type: region.type,
      parent_id: region.parent_id
    }
  }

  static getParentRegionInfo(regionId: number): RegionInfo | null {
    const regionInfo = this.getRegionInfo(regionId)
    if (!regionInfo || !regionInfo.parent_id) {
      return null
    }
    return this.getRegionInfo(regionInfo.parent_id)
  }

  static getToliSummaryList(regionId: number): DummyDataResponse {
    return this.getRegionData(regionId, 'toli')
  }

  static getParivarSummaryList(regionId: number): DummyDataResponse {
    return this.getRegionData(regionId, 'parivar')
  }

  static getUtsukSummaryList(regionId: number): DummyDataResponse {
    return this.getRegionData(regionId, 'utsuk')
  }
}
