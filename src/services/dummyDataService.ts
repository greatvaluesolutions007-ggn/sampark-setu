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

  static getParivarList(_regionId: number): DummyDataResponse {
    // Generate more dummy data for testing pagination
    const dummyParivarList = []
    const names = [
      'Rajesh Kumar', 'Mohan Lal', 'Suresh Singh', 'Ramesh Gupta', 'Vikram Sharma',
      'Amit Kumar', 'Sunil Yadav', 'Pradeep Singh', 'Rajesh Verma', 'Manoj Kumar',
      'Vikash Singh', 'Ravi Kumar', 'Sandeep Sharma', 'Anil Kumar', 'Deepak Singh',
      'Naveen Kumar', 'Rohit Sharma', 'Ajay Kumar', 'Vijay Singh', 'Sanjay Kumar',
      'Rakesh Kumar', 'Mukesh Kumar', 'Dinesh Kumar', 'Suresh Kumar', 'Mahesh Kumar'
    ]
    
    for (let i = 1; i <= 25; i++) {
      dummyParivarList.push({
        parivar_id: i,
        samparkit_sadasya: names[i % names.length] + ` (${i})`,
        purush_count: Math.floor(Math.random() * 4) + 1,
        mahila_count: Math.floor(Math.random() * 3) + 1,
        bal_count: Math.floor(Math.random() * 4),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    return {
      success: true,
      message: 'Parivar list retrieved successfully',
      statusCode: 200,
      data: dummyParivarList
    }
  }
}
