import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, UserPlus, Home, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toliService, authService } from '@/api/services'
import type { Toli } from '@/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [toli, setToli] = useState<Toli | null>(null)
  const [isLoadingToli, setIsLoadingToli] = useState(true)

  useEffect(() => {
    fetchUserAndToli()
  }, [])

  const fetchUserAndToli = async () => {
    try {
      setIsLoadingToli(true)
      
      // Get current user
      const userResponse = await authService.getCurrentUser()
      if (userResponse.success && userResponse.data.user_id) {
        const userId = userResponse.data.user_id
        const regionId = userResponse.data.region_id
        
        // Check if user has a toli - filter by region or user
        const toliResponse = await toliService.getTolis({
          region_id: regionId || undefined,
          limit: 1,
          offset: 0
        })
        
        if (toliResponse.success && toliResponse.data.length > 0) {
          // Find toli created by or assigned to this user
          const userToli = toliResponse.data.find(t => t.toli_user_id === userId) || toliResponse.data[0]
          setToli(userToli)
        }
      }
    } catch (error) {
      console.error('Error fetching user and toli:', error)
    } finally {
      setIsLoadingToli(false)
    }
  }

  if (isLoadingToli) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">संपर्क सेतु</h1>
          <p className="text-gray-600">डैशबोर्ड</p>
        </div>

        {/* Toli Section */}
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-orange-600" />
              टोली की जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!toli ? (
              <div className="text-center space-y-4 py-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 mb-4">
                    आपकी कोई टोली नहीं है। कृपया पहले टोली बनाएं।
                  </p>
                  <Button
                    onClick={() => navigate('/toli')}
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700 gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    टोली बनाएं
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">टोली का नाम</p>
                      <p className="text-xl font-semibold text-gray-900">{toli.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">टोली ID</p>
                      <p className="text-lg font-medium text-gray-900">{toli.toli_id}</p>
                    </div>
                  </div>
                </div>

                {toli.members_json && toli.members_json.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">सदस्यों की संख्या</p>
                    <p className="text-2xl font-bold text-orange-600">{toli.members_json.length}</p>
                  </div>
                )}

                <Button
                  onClick={() => navigate('/toli')}
                  variant="outline"
                  className="w-full"
                >
                  टोली विवरण देखें / संपादित करें
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Collection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Parivar Data Card */}
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-blue-600" />
                परिवार डेटा
              </CardTitle>
              <CardDescription>
                परिवार की जानकारी जोड़ें
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                परिवार के सदस्यों की संख्या, साहित्य वितरण आदि की जानकारी दर्ज करें।
              </p>
              <Button
                onClick={() => navigate('/parivar')}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                परिवार डेटा जोड़ें
              </Button>
            </CardContent>
          </Card>

          {/* Utsuk Shakti Card */}
          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-purple-600" />
                उत्सुक शक्ति
              </CardTitle>
              <CardDescription>
                नए संपर्क व्यक्ति जोड़ें
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-4">
                उत्सुक व्यक्तियों की जानकारी और उनसे जुड़े प्रश्नों के उत्तर दर्ज करें।
              </p>
              <Button
                onClick={() => navigate('/utsuk')}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                उत्सुक शक्ति जोड़ें
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 space-y-2">
              <p>💡 <strong>सुझाव:</strong> पहले टोली बनाएं, फिर परिवार और उत्सुक शक्ति डेटा जोड़ें।</p>
              <p>📊 सभी डेटा स्वचालित रूप से आपके क्षेत्र से जुड़ जाएगा।</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

