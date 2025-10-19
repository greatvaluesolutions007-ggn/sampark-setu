import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { authService, toliService } from '@/api/services'
import type { CreateToliRequest, UpdateToliRequest, ToliMember } from '@/types'

export default function ToliPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // User states
  const [regionHierarchy, setRegionHierarchy] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userMobile, setUserMobile] = useState<string>('')
  
  // Form states
  const [name, setName] = useState('')
  const [members, setMembers] = useState<ToliMember[]>([])
  
  // Existing toli state
  const [existingToliId, setExistingToliId] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Validation states
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    name: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')


  useEffect(()=>{
    fetchUserIdAndLoadToli()
  },[])

  // Validation functions
  const nameValid = name.length >= 3
  const membersValid = members.every(member => 
    member.name.length >= 3 && /^[6-9]\d{9}$/.test(member.mobile)
  )
  const membersLimitValid = members.length <= 4
  
  const isFormValid = nameValid && membersValid && membersLimitValid



  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { name: '', mobile: '' }])
    }
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: keyof ToliMember, value: string) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }



  const fetchUserIdAndLoadToli = async()=>{
    try{
      setIsLoadingData(true)
      const userResponse = await authService.getCurrentUser();
      if(userResponse.success && userResponse.data.user_id){
        const userId = userResponse.data.user_id
        const userRegionId = userResponse.data.region_id
        
        
        // Build region hierarchy and role display
        if (userResponse.data.region_details) {
          const details = userResponse.data.region_details
          const hierarchy = []
          
          // Always show Prant, Vibhag, Jila
          if (details.prant) hierarchy.push(`प्रांत: ${details.prant.name}`)
          if (details.vibhag) hierarchy.push(`विभाग: ${details.vibhag.name}`)
          if (details.jila) hierarchy.push(`जिला: ${details.jila.name}`)
          
          // Show hierarchy based on user role
          if (userResponse.data.role === 'GRAM_KARYAKARTA') {
            // GRAM_KARYAKARTA: Prant -> Vibhag -> Jila -> Khand -> Mandal -> Gram
            if (details.khand) hierarchy.push(`खंड: ${details.khand.name}`)
            if (details.mandal) hierarchy.push(`मंडल: ${details.mandal.name}`)
            if (details.gram) hierarchy.push(`ग्राम: ${details.gram.name}`)
          } else if (userResponse.data.role === 'BASTI_KARYAKARTA') {
            // BASTI_KARYAKARTA: Prant -> Vibhag -> Jila -> Nagar -> Basti
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
            if (details.basti) hierarchy.push(`बस्ती: ${details.basti.name}`)
          } else if (userResponse.data.role === 'NAGAR_KARYAKARTA') {
            // NAGAR_KARYAKARTA: Prant -> Vibhag -> Jila -> Nagar
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
          } else if (userResponse.data.role === 'JILA_KARYAKARTA') {
            // JILA_KARYAKARTA: Prant -> Vibhag -> Jila
            // Already included above
          } else if (userResponse.data.role === 'VIBHAG_KARYAKARTA') {
            // VIBHAG_KARYAKARTA: Prant -> Vibhag
            // Already included above
          } else if (userResponse.data.role === 'PRANT_KARYAKARTA') {
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
          
          // Set user role display name
          const roleDisplayNames: { [key: string]: string } = {
            'PRANT_KARYAKARTA': 'प्रांत कार्यकर्ता',
            'VIBHAG_KARYAKARTA': 'विभाग कार्यकर्ता',
            'JILA_KARYAKARTA': 'जिला कार्यकर्ता',
            'NAGAR_KARYAKARTA': 'नगर कार्यकर्ता',
            'BASTI_KARYAKARTA': 'बस्ती कार्यकर्ता',
            'GRAM_KARYAKARTA': 'ग्राम कार्यकर्ता'
          }
          setUserRole(roleDisplayNames[userResponse.data.role] || userResponse.data.role)
          
          // Set user name and mobile for Toli Pramukh info
          setUserName(userResponse.data.full_name || userResponse.data.user_name || '')
          setUserMobile(userResponse.data.mobile || '')
        }
        
        // Fetch user's existing toli and load it into form
        const toliResponse = await toliService.getTolis({
          region_id: userRegionId || undefined,
          limit: 10,
          offset: 0
        })
        
        if(toliResponse.success && toliResponse.data.length > 0) {
          // Find the user's toli (if exists)
          const userToli = toliResponse.data.find(t => t.toli_user_id === userId)
          if (userToli) {
            // Load existing toli data into form fields
            setExistingToliId(userToli.toli_id)
            setName(userToli.name)
            setMembers(userToli.members_json || [])
          }
        }
      }
    }catch(e){
      console.error('Error fetching user ID and toli:', e);
    } finally {
      setIsLoadingData(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isFormValid) return


    try {
      setIsLoading(true)
      setError('')
      
      const filteredMembers = members.filter(m => m.name.trim() !== '' || m.mobile.trim() !== '')
      
      let response
      if (existingToliId) {
        // Update existing toli
        const updateData: UpdateToliRequest = {
          toli_id: existingToliId,
          members: filteredMembers
        }
        response = await toliService.updateToli(updateData)
      } else {
        // Create new toli
        const createData: CreateToliRequest = {
          name: name,
          members: filteredMembers
        }
        response = await toliService.createToli(createData)
      }

      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to process toli')
      }

      // Show success toast
      toast({
        title: "सफलतापूर्वक सहेजा गया!",
        description: existingToliId 
          ? `टोली सफलतापूर्वक अपडेट की गई।`
          : `टोली सफलतापूर्वक बनाई गई। Toli ID: ${response.data.toli_id}`,
      })

      // If creating new, reload to show as existing
      if (!existingToliId) {
        await fetchUserIdAndLoadToli()
      }

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'टोली बनाने में त्रुटि हुई'
      setError(errorMessage)
      console.error('Error processing toli:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">लोड हो रहा है...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> वापस जाएँ
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {existingToliId ? 'टोली विवरण / संपादन' : 'गृह सम्पर्क टोली निर्माण'}
              </CardTitle>
              {existingToliId && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  टोली ID: {existingToliId}
                  <span className="block text-green-600 mt-1">✓ मौजूदा टोली लोड की गई</span>
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form id="toli-form" onSubmit={handleSubmit} className="space-y-4">
              
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

              {/* Toli Pramukh Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">टोली प्रमुख जानकारी</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-green-700">नाम:</Label>
                    <span className="text-sm text-green-600">{userName || 'नहीं दिया गया'}</span>
                  </div>
                  {userMobile && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-green-700">मोबाइल नंबर:</Label>
                      <span className="text-sm text-green-600">{userMobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-green-700">दायित्व:</Label>
                    <span className="text-sm text-green-600">{userRole || 'नहीं दिया गया'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>टोली का नाम</Label>
                <Input
                  placeholder="टोली का नाम"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                  disabled={!!existingToliId}
                  className={existingToliId ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {existingToliId && (
                  <p className="text-sm text-gray-500">टोली का नाम संपादित नहीं किया जा सकता</p>
                )}
                {(submitAttempted || touchedFields.name) && !nameValid && !existingToliId && (
                  <p className="text-sm text-primary">टोली का नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">सदस्य</Label>

                {members.map((member, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>नाम</Label>
                      <Input
                        placeholder="सदस्य का नाम"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>मोबाइल</Label>
                      <Input
                        placeholder="मोबाइल नंबर"
                        value={member.mobile}
                        onChange={(e) => updateMember(index, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(index)}
                        className="flex items-center gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        सदस्य हटाएँ
                      </Button>
                    </div>
                  </div>
                ))}

                {submitAttempted && !membersValid && members.length > 0 && (
                  <p className="text-sm text-primary">सभी सदस्यों का नाम और मोबाइल नंबर वैध होना चाहिए</p>
                )}

                {submitAttempted && !membersLimitValid && (
                  <p className="text-sm text-primary">अधिकतम 4 सदस्य जोड़े जा सकते हैं</p>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    सदस्य: {members.length}/4
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMember}
                    disabled={members.length >= 4}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    सदस्य जोड़ें
                  </Button>
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
        <div className="max-w-xl mx-auto">
          <Button type="submit" form="toli-form" className="w-full" disabled={!isFormValid || isLoading}>
            {isLoading 
              ? (existingToliId ? 'अपडेट हो रहा है...' : 'टोली बनाई जा रही है...') 
              : (existingToliId ? 'टोली अपडेट करें' : 'टोली बनाएं')}
          </Button>
        </div>
      </div>
    </div>
  )
}