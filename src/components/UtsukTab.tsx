import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { reportingService } from '@/api/services'

export default function UtsukTab() {
  const [utsukCount, setUtsukCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUtsukSummary()
  }, [])

  const fetchUtsukSummary = async () => {
    try {
      setIsLoading(true)
      const response = await reportingService.getUtsukSummary()
      if (response.success) {
        setUtsukCount(response.data.utsuk_count ?? 0)
      }
    } catch (error) {
      console.error('Error fetching utsuk summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="कुल उत्सुक शक्ति सदस्य"
          value={isLoading ? '...' : utsukCount.toString()}
          icon={<Users className="h-6 w-6" />}
          color="bg-green-100 text-green-600"
        />
      </div>
    </div>
  )
}

