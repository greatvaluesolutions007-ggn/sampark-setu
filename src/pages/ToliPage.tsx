import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import FullHierarchyRegionSelector from '@/components/FullHierarchyRegionSelector'
import { authService, toliService } from '@/api/services'
import type { CreateToliRequest, ToliMember } from '@/types'

export default function ToliPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Region states
  const [regionId, setRegionId] = useState<number | null>(null);
  const [toliUserId, setToliUserId] = useState<number | null>(null); // To link toli to a user if needed
  
  // Form states
  const [name, setName] = useState('')
  const [pramukh, setPramukh] = useState<ToliMember>({ name: '', mobile: '' })
  const [members, setMembers] = useState<ToliMember[]>([])
  
  // Validation states
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    pramukhName: false,
    pramukhMobile: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')


  useEffect(()=>{
    fetchUserId()
  },[])

  // Validation functions
  const nameValid = name.length >= 3
  const membersValid = members.every(member => 
    member.name.length >= 3 && /^[6-9]\d{9}$/.test(member.mobile)
  )
  
  const isFormValid = nameValid && membersValid

  // Handle region changes from FullHierarchyRegionSelector
  const handleRegionChange = (regionId: number, regionName: string, regionType: string) => {
    console.log('handleRegionChange called with:', { regionId, regionName, regionType })
    setRegionId(regionId)
  }


  const addMember = () => {
    setMembers([...members, { name: '', mobile: '' }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: keyof ToliMember, value: string) => {
    const newMembers = [...members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setMembers(newMembers)
  }



  const fetchUserId = async()=>{
    try{
      const userResponse = await authService.getCurrentUser();
      if(userResponse.success && userResponse.data.user_id){
        setToliUserId(userResponse.data.user_id);
      }
    }catch(e){
      console.error('Error fetching user ID:', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isFormValid) return

    if (!regionId) {
      setError('कृपया पहले क्षेत्र की जानकारी लोड होने दें')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const toliData: CreateToliRequest = {
        name: name,
        members: members.filter(m => m.name.trim() !== '' || m.mobile.trim() !== '')
      }

      const response = await toliService.createToli(toliData)

      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to create toli')
      }

      // Show success toast
      toast({
        title: "सफलतापूर्वक सहेजा गया!",
        description: `टोली सफलतापूर्वक बनाई गई। Toli ID: ${response.data.toli_id}`,
      })

      // Reset form on success
      setName('')
      setPramukh({ name: '', mobile: '' })
      setMembers([])
      setSubmitAttempted(false)
      setTouchedFields({ name: false, pramukhName: false, pramukhMobile: false })

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'टोली बनाने में त्रुटि हुई'
      setError(errorMessage)
      console.error('Error creating toli:', err)
    } finally {
      setIsLoading(false)
    }
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
              <CardTitle className="text-xl text-center">टोली निर्माण</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="toli-form" onSubmit={handleSubmit} className="space-y-4">
              <FullHierarchyRegionSelector 
                onRegionChange={handleRegionChange}
                disabled={isLoading}
                refreshKey={toliUserId || undefined} // This will refresh the component when user changes
              />

              <div className="space-y-2">
                <Label>टोली का नाम</Label>
                <Input
                  placeholder="टोली का नाम"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                />
                {(submitAttempted || touchedFields.name) && !nameValid && (
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

                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMember}
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
            {isLoading ? 'टोली बनाई जा रही है...' : 'टोली बनाएं'}
          </Button>
        </div>
      </div>
    </div>
  )
}