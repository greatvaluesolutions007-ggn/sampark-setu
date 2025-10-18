import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, User, UserCheck, Baby } from 'lucide-react'
import { parivarListService } from '@/api/services'
import type { ParivarListItem } from '@/types'

interface ParivarListViewProps {
  user: any
}

export default function ParivarListView({ user }: ParivarListViewProps) {
  const [parivarList, setParivarList] = useState<ParivarListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchParivarList()
  }, [user])

  const fetchParivarList = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      if (!user?.region_id) {
        setError('Region ID not found')
        return
      }

      const response = await parivarListService.getParivarList(user.region_id)
      
      if (response.success) {
        setParivarList(response.data)
      } else {
        setError(response.message || 'Failed to fetch parivar list')
      }
    } catch (err) {
      console.error('Error fetching parivar list:', err)
      setError('Failed to fetch parivar list')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">सम्पर्कित परिवार जानकारी</h1>
          <p className="text-gray-600">आपके द्वारा जोड़े गए परिवारों की सूची</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">कुल परिवार</p>
                  <p className="text-2xl font-bold text-blue-800">{parivarList.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">कुल पुरुष</p>
                  <p className="text-2xl font-bold text-green-800">
                    {parivarList.reduce((sum, item) => sum + item.purush_count, 0)}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-600">कुल महिलाएं</p>
                  <p className="text-2xl font-bold text-pink-800">
                    {parivarList.reduce((sum, item) => sum + item.mahila_count, 0)}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">कुल बच्चे</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {parivarList.reduce((sum, item) => sum + item.bal_count, 0)}
                  </p>
                </div>
                <Baby className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parivar List */}
        {parivarList.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">कोई परिवार डेटा नहीं मिला</p>
                <p className="text-gray-500 text-sm mt-2">परिवार डेटा जोड़ने के लिए टोली जानकारी टैब पर जाएं</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {parivarList.map((parivar, index) => (
              <Card key={parivar.parivar_id} className={`border-2 shadow-lg hover:shadow-xl transition-shadow ${
                index % 2 === 0 ? 'border-orange-200' : 'border-blue-200'
              }`}>
                <CardHeader className={`${index % 2 === 0 ? 'bg-gradient-to-r from-orange-50 to-orange-100' : 'bg-gradient-to-r from-blue-50 to-blue-100'} rounded-t-xl`}>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className={`h-5 w-5 ${index % 2 === 0 ? 'text-orange-600' : 'text-blue-600'}`} />
                    संपर्कित सदस्य - {parivar.samparkit_sadasya}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">पुरुष</p>
                      <p className="text-2xl font-bold text-green-800">{parivar.purush_count}</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <p className="text-sm text-pink-600 font-medium">महिलाएं</p>
                      <p className="text-2xl font-bold text-pink-800">{parivar.mahila_count}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">बच्चे</p>
                      <p className="text-2xl font-bold text-purple-800">{parivar.bal_count}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>परिवार ID: {parivar.parivar_id}</span>
                      <span>अपडेट: {new Date(parivar.updated_at).toLocaleDateString('hi-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
