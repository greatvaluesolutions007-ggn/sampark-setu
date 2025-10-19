import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, Users } from 'lucide-react'
import { utsukDetailService, authService } from '@/api/services'
import type { UtsukDetailItem, UtsukSummaryData } from '@/types'

export default function UtsukDetailPage() {
  const [summaryData, setSummaryData] = useState<UtsukSummaryData | null>(null)
  const [detailList, setDetailList] = useState<UtsukDetailItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Get current user
      const userResponse = await authService.getCurrentUser()
      if (userResponse.success && userResponse.data.region_id) {
        const regionId = userResponse.data.region_id

        // Fetch summary data
        const summaryResponse = await utsukDetailService.getUtsukSummaryData(regionId)
        if (summaryResponse.success) {
          setSummaryData(summaryResponse.data)
        }

        // Fetch detailed list
        const detailResponse = await utsukDetailService.getUtsukDetailList(regionId, currentPage, 10)
        if (detailResponse.success) {
          setDetailList(detailResponse.data)
          if (detailResponse.pagination) {
            setTotalPages(detailResponse.pagination.total_pages)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching utsuk data:', err)
      setError('डेटा लोड करने में त्रुटि हुई')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <UserCheck className="h-6 w-6 text-purple-600" />
            उत्सुक शक्ति जानकारी
          </h1>
          <p className="text-gray-600">आपके क्षेत्र की उत्सुक शक्ति की विस्तृत जानकारी</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {summaryData && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  कुल उत्सुक शक्ति
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-purple-600">{summaryData.total_utsuk}</p>
                <p className="text-sm text-gray-600 mt-2">कुल उत्सुक व्यक्ति</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  पुरुष
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-blue-600">{summaryData.total_purush}</p>
                <p className="text-sm text-gray-600 mt-2">पुरुष उत्सुक शक्ति</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-pink-600" />
                  महिला
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-pink-600">{summaryData.total_mahila}</p>
                <p className="text-sm text-gray-600 mt-2">महिला उत्सुक शक्ति</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed List */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCheck className="h-6 w-6 text-gray-600" />
              विस्तृत जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {detailList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">कोई उत्सुक शक्ति डेटा उपलब्ध नहीं है</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {detailList.map((item) => (
                  <Card key={item.person_id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {/* Name */}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        </div>
                        
                        {/* Visheshta */}
                        {item.visheshta && (
                          <div>
                            <span className="text-xs text-gray-600">विशेषता: </span>
                            <span className="text-xs text-gray-800">{item.visheshta}</span>
                          </div>
                        )}
                        
                        {/* Upyogita */}
                        {item.upyogita && (
                          <div>
                            <span className="text-xs text-gray-600">उपयोगिता: </span>
                            <span className="text-xs text-gray-800">{item.upyogita}</span>
                          </div>
                        )}

                        {/* Questions and Answers */}
                        {item.answers_json && Object.keys(item.answers_json).length > 0 && (
                          <div className="space-y-1">
                            {Object.entries(item.answers_json).map(([question, answer]) => (
                              <div key={question} className="bg-gray-50 p-2 rounded text-xs">
                                <span className="text-gray-600">{question}: </span>
                                <span className="text-gray-800">{answer}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Date */}
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            जोड़ा गया: {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  पिछला
                </Button>
                
                <span className="text-sm text-gray-600">
                  पेज {currentPage} का {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  अगला
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
