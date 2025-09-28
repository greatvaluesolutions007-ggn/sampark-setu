import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import RegionSelector from '@/components/RegionSelector'
import { authService, regionService, toliService } from '@/api/services'
import type { CreateToliRequest, RegionResponse, ToliMember } from '@/types'

export default function ToliPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Region states
  const [prant, setPrant] = useState<string>('')
  const [vibhag, setVibhag] = useState<string>('')
  const [jila, setJila] = useState<string>('')
  const [nagar, setNagar] = useState<string>('')
  const [regionResponse, setRegionResponse] =  useState<RegionResponse|null>(null);
  const [regionId, setRegionId] = useState<number | null>(null);
  
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
    fetchUserRegion()
  },[])

  // Validation functions
  const nameValid = name.length >= 3
  const pramukhNameValid = pramukh.name.length >= 3
  const pramukhMobileValid = /^[6-9]\d{9}$/.test(pramukh.mobile)
  const membersValid = members.every(member => 
    member.name.length >= 3 && /^[6-9]\d{9}$/.test(member.mobile)
  )
  
  const isFormValid = nameValid && pramukhNameValid && pramukhMobileValid && membersValid

  // Handle region changes from RegionSelector
  const handleRegionChange = (prantValue: string, vibhagValue: string, jilaValue: string, nagarValue: string) => {
    console.log('handleRegionChange called with:', { prantValue, vibhagValue, jilaValue, nagarValue })
    
    setPrant(prantValue)
    setVibhag(vibhagValue)
    setJila(jilaValue)
    setNagar(nagarValue)
    
    // Set regionId based on the selected values (priority: nagar > jila > vibhag > prant)
    const selectedRegionId = nagarValue || jilaValue || vibhagValue || prantValue
    if (selectedRegionId) {
      setRegionId(parseInt(selectedRegionId))
      console.log('Region changed, new regionId:', selectedRegionId)
    } else {
      console.log('No regionId selected from values:', { prantValue, vibhagValue, jilaValue, nagarValue })
    }
  }

  // Handle mobile input - only allow digits and limit to 10
  const handleMobileChange = (value: string, setter: React.Dispatch<React.SetStateAction<ToliMember>>) => {
    const mobileValue = value.replace(/\D/g, '').slice(0, 10)
    setter(prev => ({ ...prev, mobile: mobileValue }))
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



  const fetchUserRegion  = async()=>{
    try{
    
      const userResponse = await authService.getCurrentUser();

      if(userResponse.success && userResponse.data.region_id){
         const response = await regionService.fetchRegions(userResponse.data.region_id, true);
      if(response && response.success){

        setRegionResponse(response);
        
        // Set default regionId - use the first available region from the hierarchy
        const regionData = response.data;
        console.log('Region data received:', regionData);
        console.log('Child regions:', regionData.child_regions);
        
        let defaultRegionId = null;
        
        // Priority: nagar > jila > vibhag > prant
        // Access the id property from RegionType objects
        if (regionData.child_regions?.nagar && regionData.child_regions.nagar.length > 0) {
          defaultRegionId = regionData.child_regions.nagar[0].id;
          console.log('Selected nagar regionId:', defaultRegionId, 'from:', regionData.child_regions.nagar[0]);
        } else if (regionData.child_regions?.jila && regionData.child_regions.jila.length > 0) {
          defaultRegionId = regionData.child_regions.jila[0].id;
          console.log('Selected jila regionId:', defaultRegionId, 'from:', regionData.child_regions.jila[0]);
        } else if (regionData.child_regions?.vibhag && regionData.child_regions.vibhag.length > 0) {
          defaultRegionId = regionData.child_regions.vibhag[0].id;
          console.log('Selected vibhag regionId:', defaultRegionId, 'from:', regionData.child_regions.vibhag[0]);
        } else if (userResponse.data.region_id) {
          defaultRegionId = userResponse.data.region_id;
          console.log('Using user region_id:', defaultRegionId);
        }
        
        if (defaultRegionId) {
          setRegionId(defaultRegionId);
          console.log('Default regionId set:', defaultRegionId);
        } else {
          console.log('No default regionId found');
        }
      }
      }
     
    }catch(e){
      console.error('Error fetching user region:', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isFormValid) return

    try {
      setIsLoading(true)
      setError('')

      const toliData: CreateToliRequest = {
        name: name,
        type: 'NAGAR', // Default to NAGAR type
        region_id: regionId || (nagar ? parseInt(nagar) : parseInt(jila) || parseInt(vibhag) || parseInt(prant)),
        pramukh: pramukh,
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
      setPrant('')
      setVibhag('')
      setJila('')
      setNagar('')
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
              <RegionSelector 
                onRegionChange={handleRegionChange}
                disabled={isLoading}
                regionDetails={regionResponse?.data}

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
                <Label className="text-lg font-semibold">प्रमुख</Label>
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>नाम</Label>
                    <Input
                      placeholder="प्रमुख का नाम"
                      value={pramukh.name}
                      onChange={(e) => {
                        setPramukh(prev => ({ ...prev, name: e.target.value }))
                        setTouchedFields(prev => ({ ...prev, pramukhName: true }))
                      }}
                    />
                    {(submitAttempted || touchedFields.pramukhName) && !pramukhNameValid && (
                      <p className="text-sm text-primary">नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>मोबाइल</Label>
                    <Input
                      placeholder="मोबाइल नंबर"
                      value={pramukh.mobile}
                      onChange={(e) => handleMobileChange(e.target.value, setPramukh)}
                      maxLength={10}
                    />
                    {(submitAttempted || touchedFields.pramukhMobile) && !pramukhMobileValid && (
                      <p className="text-sm text-primary">कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें</p>
                    )}
                  </div>
                </div>
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