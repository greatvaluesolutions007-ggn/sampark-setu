import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { reportingService, authService } from '@/api/services'
import { Label } from '@/components/ui/label'
import type { ParivarSummaryResponse } from '@/types'

export default function ParivarTab() {
  const [summary, setSummary] = useState<Required<ParivarSummaryResponse>>({
    total_families: 0,
    total_contacted: 0,
    male_count: 0,
    female_count: 0,
    kids_count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [regionHierarchy, setRegionHierarchy] = useState<string>('')

  useEffect(() => {
    fetchParivarSummary()
    getUserRegion()
  }, [])

  const fetchParivarSummary = async () => {
    try {
      setIsLoading(true)
      const response = await reportingService.getParivarSummary()
      if (response.success) {
        setSummary({
          total_families: response.data.total_families ?? 0,
          total_contacted: response.data.total_contacted ?? 0,
          male_count: response.data.male_count ?? 0,
          female_count: response.data.female_count ?? 0,
          kids_count: response.data.kids_count ?? 0,
        })
      }
    } catch (error) {
      console.error('Error fetching parivar summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserRegion = async () => {
    try {
      const userRegion = await authService.getCurrentUser()
      if (userRegion.success && userRegion.data) {
        // Build region hierarchy string from user's region details
        if (userRegion.data.region_details) {
          const details = userRegion.data.region_details
          const hierarchy = []
          
          // Always show Prant, Vibhag, Jila
          if (details.prant) hierarchy.push(`प्रांत: ${details.prant.name}`)
          if (details.vibhag) hierarchy.push(`विभाग: ${details.vibhag.name}`)
          if (details.jila) hierarchy.push(`जिला: ${details.jila.name}`)
          
          // Show hierarchy based on user role
          if (userRegion.data.role === 'GRAM_KARYAKARTA') {
            // GRAM_KARYAKARTA: Prant -> Vibhag -> Jila -> Khand -> Mandal -> Gram
            if (details.khand) hierarchy.push(`खंड: ${details.khand.name}`)
            if (details.mandal) hierarchy.push(`मंडल: ${details.mandal.name}`)
            if (details.gram) hierarchy.push(`ग्राम: ${details.gram.name}`)
          } else if (userRegion.data.role === 'BASTI_KARYAKARTA') {
            // BASTI_KARYAKARTA: Prant -> Vibhag -> Jila -> Nagar -> Basti
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
            if (details.basti) hierarchy.push(`बस्ती: ${details.basti.name}`)
          } else if (userRegion.data.role === 'NAGAR_KARYAKARTA') {
            // NAGAR_KARYAKARTA: Prant -> Vibhag -> Jila -> Nagar
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
          } else if (userRegion.data.role === 'JILA_KARYAKARTA') {
            // JILA_KARYAKARTA: Prant -> Vibhag -> Jila
            // Already included above
          } else if (userRegion.data.role === 'VIBHAG_KARYAKARTA') {
            // VIBHAG_KARYAKARTA: Prant -> Vibhag
            // Already included above
          } else if (userRegion.data.role === 'PRANT_KARYAKARTA') {
            // PRANT_KARYAKARTA: Prant
            // Already included above
          } else {
            // For other roles, show available details
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
            if (details.khand) hierarchy.push(`खंड: ${details.khand.name}`)
            if (details.mandal) hierarchy.push(`मंडल: ${details.mandal.name}`)
            if (details.gram) hierarchy.push(`ग्राम: ${details.gram.name}`)
            if (details.basti) hierarchy.push(`बस्ती: ${details.basti.name}`)
          }
          
          setRegionHierarchy(hierarchy.join(' > '))
        }
      }
    } catch (error) {
      console.error('Error fetching user region:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-primary mb-4">परिवार विवरण</h2>
      
      {/* Display User Region Hierarchy */}
      {regionHierarchy && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <Label className="text-sm font-medium text-blue-800">आपका क्षेत्र</Label>
          <p className="text-sm text-blue-700 mt-1">{regionHierarchy}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="कुल परिवार"
          value={isLoading ? '...' : summary.total_families.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="कुल संपर्कित"
          value={isLoading ? '...' : summary.total_contacted.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-green-100 text-green-600"
        />
      </div>

      <div className="space-y-4">
        <StatCard
          title="पुरुष"
          value={isLoading ? '...' : summary.male_count.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="महिलाएं"
          value={isLoading ? '...' : summary.female_count.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-pink-100 text-pink-600"
        />
        <StatCard
          title="बच्चे"
          value={isLoading ? '...' : summary.kids_count.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-purple-100 text-purple-600"
        />
      </div>
    </div>
  )
}

