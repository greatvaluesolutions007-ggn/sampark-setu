import { useEffect, useState } from 'react'
import { BookOpen, FileText } from 'lucide-react'
import StatCard from '@/components/StatCard'
import { reportingService } from '@/api/services'
import type { SahityaSummaryResponse } from '@/types'

export default function SahityaTab() {
  const [summary, setSummary] = useState<Required<SahityaSummaryResponse>>({
    sticker_count: 0,
    total_folder: 0,
    nishulk_books: 0,
    shashulk_books: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSahityaSummary()
  }, [])

  const fetchSahityaSummary = async () => {
    try {
      setIsLoading(true)
      const response = await reportingService.getSahityaSummary()
      if (response.success) {
        setSummary({
          sticker_count: response.data.sticker_count ?? 0,
          total_folder: response.data.total_folder ?? 0,
          nishulk_books: response.data.nishulk_books ?? 0,
          shashulk_books: response.data.shashulk_books ?? 0,
        })
      }
    } catch (error) {
      console.error('Error fetching sahitya summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Free Content Section */}
      <h2 className="text-lg font-semibold text-primary mb-4">निशुल्क साहित्य</h2>
      <div className="space-y-4">
        <StatCard
          title="कुल स्टीकर"
          value={isLoading ? '...' : summary.sticker_count.toString()}
          icon={<BookOpen className="h-6 w-6" />}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="कुल फोल्डर"
          value={isLoading ? '...' : summary.total_folder.toString()}
          icon={<BookOpen className="h-6 w-6" />}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Paid Content Section */}
      <h2 className="text-lg font-semibold text-primary mb-4">सशुल्क साहित्य</h2>
      <div className="space-y-4">
        <StatCard
          title="कुल पुस्तकें (सशुल्क)"
          value={isLoading ? '...' : summary.shashulk_books.toString()}
          icon={<FileText className="h-6 w-6" />}
          color="bg-orange-100 text-orange-600"
        />
      </div>
    </div>
  )
}

