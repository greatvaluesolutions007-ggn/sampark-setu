import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { reportingService } from '@/api/services'
import type { ParivarSummaryResponse } from '@/types'

export default function ParivarTab() {
  const [summary, setSummary] = useState<ParivarSummaryResponse>({
    total_families: 0,
    total_contacted: 0,
    male_count: 0,
    female_count: 0,
    kids_count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchParivarSummary()
  }, [])

  const fetchParivarSummary = async () => {
    try {
      setIsLoading(true)
      const response = await reportingService.getParivarSummary()
      if (response.success) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error('Error fetching parivar summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-primary mb-4">परिवार विवरण</h2>
      
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

