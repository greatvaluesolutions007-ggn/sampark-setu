import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { authService, visitService } from '@/api/services'
import type { CreateVisitRequest } from '@/types'

export default function ParivarPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Region hierarchy state
  const [regionHierarchy, setRegionHierarchy] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    getUserRegion()
  }, [])

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
          } else {
            // For other roles, show available details
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
            if (details.khand) hierarchy.push(`खंड: ${details.khand.name}`)
            if (details.mandal) hierarchy.push(`मंडल: ${details.mandal.name}`)
            if (details.gram) hierarchy.push(`ग्राम: ${details.gram.name}`)
            if (details.basti) hierarchy.push(`बस्ती: ${details.basti.name}`)
          }
          
          setRegionHierarchy(hierarchy.join(' > '))
          
          // Set user role display name
          const roleDisplayNames: { [key: string]: string } = {
            'PRANT_KARYAKARTA': 'प्रांत कार्यकर्ता',
            'VIBHAG_KARYAKARTA': 'विभाग कार्यकर्ता',
            'JILA_KARYAKARTA': 'जिला कार्यकर्ता',
            'NAGAR_KARYAKARTA': 'नगर कार्यकर्ता',
            'BASTI_KARYAKARTA': 'बस्ती कार्यकर्ता',
            'GRAM_KARYAKARTA': 'ग्राम कार्यकर्ता'
          }
          setUserRole(roleDisplayNames[userRegion.data.role] || userRegion.data.role)
        }
      }
    } catch (error) {
      console.error('Error fetching user region:', error)
    }
  }
  
  // Form states
  const [samparkit, setSamparkit] = useState('')
  const [phone, setPhone] = useState('')
  const [isSpecialContact, setIsSpecialContact] = useState<'yes' | 'no'>('no')
  const [specialInfo, setSpecialInfo] = useState('')
  const [purush, setPurush] = useState(0)
  const [mahila, setMahila] = useState(0)
  const [bachche, setBachche] = useState(0)
  const [nahiMilSake, setNahiMilSake] = useState(0)
  
  // Calculate total automatically
  const kul = purush + mahila + bachche
  
  // Literature counters
  const [nishulkSticker, setNishulkSticker] = useState(0)
  const [nishulkFolder, setNishulkFolder] = useState(0)
  const [nishulkPustak, setNishulkPustak] = useState(0)
  const [shashulkPustak, setShashulkPustak] = useState(0)
  
  // Validation states
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [touchedName, setTouchedName] = useState(false)
  const [touchedPhone, setTouchedPhone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Validation functions
  const nameValid = samparkit.length >= 3
  const phoneValid = /^\d{10}$/.test(phone)
  const kulValid = kul > 0
  const purushValid = purush >= 0
  const mahilaValid = mahila >= 0
  const bachcheValid = bachche >= 0
  
  const isFormValid = nameValid && phoneValid && kulValid && purushValid && mahilaValid && bachcheValid

  // Counter functions
  const inc = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => prev + 1)
  }

  const dec = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => Math.max(0, prev - 1))
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isFormValid) return

    try {
      setIsLoading(true)
      setError('')

      const visitData: CreateVisitRequest = {
        person_name: samparkit,
        person_phone: phone,
        person_sex: 'OTHER',
        total_members: kul,
        male_count: purush,
        female_count: mahila,
        kids_count: bachche,
        nishulk_sticker: nishulkSticker,
        nishulk_folder: nishulkFolder,
        nishulk_books: nishulkPustak,
        shashulk_pushtak: shashulkPustak,
        is_special_contact: isSpecialContact === 'yes',
        special_contact_info: isSpecialContact === 'yes' ? specialInfo : undefined
        // region_id will be extracted from auth token in backend
      }

      const response = await visitService.createVisit(visitData)

      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to create visit')
      }

      // Show success toast
      toast({
        title: "सफलतापूर्वक सहेजा गया!",
        description: `परिवार डेटा सफलतापूर्वक सहेजा गया। Visit ID: ${response.data.visit_id}`,
      })

      // Reset form on success
      setSamparkit('')
      setPhone('')
      setIsSpecialContact('no')
      setSpecialInfo('')
      setPurush(0)
      setMahila(0)
      setBachche(0)
      setNahiMilSake(0)
      setNishulkSticker(0)
      setNishulkFolder(0)
      setNishulkPustak(0)
      setShashulkPustak(0)
      setSubmitAttempted(false)
      setTouchedPhone(false)

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'डेटा सहेजने में त्रुटि हुई'
      setError(errorMessage)
      console.error('Error creating visit:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-2xl mx-auto py-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> वापस जाएँ
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">परिवार डेटा संग्रह</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="parivar-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Display User Region Hierarchy and Role */}
              {(regionHierarchy || userRole) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    {userRole && (
                      <div>
                        <p className="text-sm text-blue-700">{userRole}</p>
                      </div>
                    )}
                    {regionHierarchy && (
                      <div>
                        <Label className="text-sm font-medium text-blue-800">आपका क्षेत्र</Label>
                        <p className="text-sm text-blue-700 mt-1">{regionHierarchy}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>संपर्कित सदस्य</Label>
                  <Input
                    placeholder="नाम"
                    value={samparkit}
                    onChange={(e) => setSamparkit(e.target.value)}
                    onBlur={() => setTouchedName(true)}
                  />
                  {(submitAttempted || touchedName) && !nameValid && (
                    <p className="text-sm text-primary">नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>फ़ोन नंबर</Label>
                  <Input
                    type="tel"
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouchedPhone(true)}
                    maxLength={10}
                  />
                  {(submitAttempted || touchedPhone) && !phoneValid && (
                    <p className="text-sm text-primary">कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें</p>
                  )}
                </div>

                {/* Special Contact List Question */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">क्या विशेष सम्पर्क सूची में है?</Label>
                  <RadioGroup 
                    value={isSpecialContact} 
                    onValueChange={(value: 'yes' | 'no') => {
                      setIsSpecialContact(value)
                      if (value === 'no') {
                        setSpecialInfo('')
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="special-yes" />
                      <Label htmlFor="special-yes" className="font-normal cursor-pointer">हाँ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="special-no" />
                      <Label htmlFor="special-no" className="font-normal cursor-pointer">नहीं</Label>
                    </div>
                  </RadioGroup>

                  {/* Conditional Special Information Text Area */}
                  {isSpecialContact === 'yes' && (
                    <div className="space-y-2 mt-3">
                      <Label>विशेष जानकारी</Label>
                      <Textarea
                        placeholder="विशेष जानकारी यहाँ दर्ज करें..."
                        value={specialInfo}
                        onChange={(e) => setSpecialInfo(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Total Family Members - Read Only */}
                <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                  <Label className="text-base font-medium">परिवार में कुल सम्पर्कित सदस्य</Label>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-center font-medium text-gray-600">{kul}</span>
                  </div>
                </div>
                {submitAttempted && !kulValid && (
                  <p className="text-sm text-red-500">कुल सदस्य संख्या 0 से अधिक होनी चाहिए</p>
                )}

                {/* Male Counter */}
                <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <Label className="text-base font-medium">सम्पर्कित पुरुष</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dec(setPurush)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{purush}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => inc(setPurush)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Female Counter */}
                <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <Label className="text-base font-medium">सम्पर्कित महिलाएं</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dec(setMahila)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{mahila}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => inc(setMahila)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Children Counter */}
                <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <Label className="text-base font-medium">सम्पर्कित बच्चे</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dec(setBachche)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{bachche}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => inc(setBachche)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Not Contacted Counter */}
                <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                  <Label className="text-base font-medium">नहीं मिल सके ऐसे कितने पारिवारिक सदस्य</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => dec(setNahiMilSake)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{nahiMilSake}</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => inc(setNahiMilSake)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

              </div>


              {/* Nishulk Sahitya */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">निशुल्क साहित्य</Label>
                <div className="space-y-3 p-4 border rounded-lg">
                  {/* Sticker Counter */}
                  <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <Label className="text-base font-medium">स्टीकर</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => dec(setNishulkSticker)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{nishulkSticker}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inc(setNishulkSticker)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Folder Counter */}
                  <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <Label className="text-base font-medium">फोल्डर</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => dec(setNishulkFolder)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{nishulkFolder}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inc(setNishulkFolder)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Pustak Counter */}
                  {/* <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <Label className="text-base font-medium">पुस्तक</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => dec(setNishulkPustak)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{nishulkPustak}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inc(setNishulkPustak)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Shashulk Sahitya */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">सशुल्क</Label>
                <div className="space-y-3 p-4 border rounded-lg">
                  {/* Pustak Counter */}
                  <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <Label className="text-base font-medium">पुस्तक</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => dec(setShashulkPustak)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{shashulkPustak}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inc(setShashulkPustak)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button type="submit" form="parivar-form" className="w-full" disabled={!isFormValid || isLoading}>
            {isLoading ? 'सहेजा जा रहा है...' : 'सहेजें'}
          </Button>
        </div>
      </div>
    </div>
  )
}