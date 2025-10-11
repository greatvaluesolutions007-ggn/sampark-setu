import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import StatCard from '@/components/StatCard'
import { reportingService } from '@/api/services'
import type { User } from '@/types'

interface OverviewTabProps {
  user: User | null
}

export default function OverviewTab({ user }: OverviewTabProps) {
  const isDashboard = ['BASTI_KARYAKARTA', 'GRAM_KARYAKARTA'].includes(user?.role ?? '')
  const [toliCount, setToliCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isDashboard) {
      fetchToliSummary()
    }
  }, [isDashboard])

  const fetchToliSummary = async () => {
    try {
      setIsLoading(true)
      const response = await reportingService.getToliSummary()
      if (response.success) {
        setToliCount(response.data.total_tolies ?? 0)
      }
    } catch (error) {
      console.error('Error fetching toli summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isDashboard ? (
        <Dashboard />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="कुल टोलिया"
            value={isLoading ? '...' : toliCount.toString()}
            icon={<Users className="h-6 w-6" />}
            color="bg-blue-100 text-blue-600"
          />
        </div>
      )}
    </div>
  )
}

