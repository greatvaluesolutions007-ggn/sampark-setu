import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { authService, personService } from '@/api/services'
import type { CreatePersonRequest } from '@/types'

export default function UtsukPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [regionId, setRegionId] = useState<number | null>(null) 
  
  // Region hierarchy state
  const [regionHierarchy, setRegionHierarchy] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  
  // Form states
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    sex: '',
    address: '',
    vishesh: '',
    upyogita: ''
  })
  
  // Questions
  const questions = [
    'पहले से संघ स्वयंसेवक हैं ?',
    "संघ परिवार पृष्ठभूमि से हैं ?",
    'संघ विचार से प्रभावित हैं ?',
    'अपने किसी विविध संगठन से सम्बन्धित हैं ?',
    'कोई परिचित / मित्र आदि स्वयंसेवक हैं ?'

  ]
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  
  // Validation states
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    sex: false,
    address: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Validation functions
  const nameValid = form.name.length >= 3
  const phoneValid = !form.phone || /^[6-9]\d{9}$/.test(form.phone)
  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const sexValid = form.sex !== ''
  const addressValid = form.address.length >= 10
  const questionsValid = selectedAnswer !== ''
  
  const isFormValid = nameValid && phoneValid && emailValid && sexValid && addressValid && questionsValid

   useEffect(() => {
     getUserRegion()
    }, [])

  const getUserRegion = async () => {
    try {
      const userRegion = await authService.getCurrentUser()
      if (userRegion.success && userRegion.data) {
        setRegionId(userRegion.data.region_id)
        
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


  // Handle phone input - only allow digits and limit to 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm(prev => ({ ...prev, phone: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isFormValid) return

    try {
      setIsLoading(true)
      setError('')

      const personData: CreatePersonRequest = {
        name: form.name,
        phone_number: form.phone || undefined,
        email: form.email || undefined,
        sex: form.sex as 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED',
        address_text: form.address || undefined,
        region_id: regionId!,
        visheshta: form.vishesh || undefined,
        upyogita: form.upyogita || undefined,
        answers: selectedAnswer ? {
          [questions[parseInt(selectedAnswer.split('-')[0])]]: selectedAnswer.split('-')[1] === 'yes' ? 'हाँ' : 'नहीं'
        } : {}
      }

      const response = await personService.createPerson(personData)

      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to create person')
      }

      // Show success toast
      toast({
        title: "सफलतापूर्वक सहेजा गया!",
        description: `उत्सुक शक्ति डेटा सफलतापूर्वक सहेजा गया। Person ID: ${response.data.person_id}`,
      })

      // Reset form on success
      setForm({ name: '', phone: '', email: '', sex: '', address: '', vishesh: '', upyogita: '' })
      setSelectedAnswer('')
      setSubmitAttempted(false)
      setTouchedFields({ name: false, sex: false, address: false })

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'डेटा सहेजने में त्रुटि हुई'
      setError(errorMessage)
      console.error('Error creating person:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> वापस जाएँ
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">उत्सुक शक्ति जोड़ें</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="utsuk-form" onSubmit={handleSubmit} className="space-y-4">
              
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

              <div className="space-y-2">
                <Label>नाम / Name</Label>
                <Input
                  placeholder="नाम / Name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                />
                {(submitAttempted || touchedFields.name) && !nameValid && (
                  <p className="text-sm text-primary">नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                )}
              </div>

              {/* //TODO: add this field to api */}

               <div className="space-y-2">
                <Label>पिता जी का नाम / Father's Name</Label>
                <Input
                  placeholder="पिता जी का नाम / Father's Name"
                  onChange={(e) =>{}}
                />
                {/* {(submitAttempted || touchedFields.name) && !nameValid && (
                  <p className="text-sm text-primary">नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                )} */}
              </div>

              <div className="space-y-2">
                <Label>मोबाइल नंबर / Mobile Number</Label>
                <Input
                  placeholder="मोबाइल नंबर / Mobile Number"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                />
                {submitAttempted && !phoneValid && (
                  <p className="text-sm text-primary">कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>ईमेल / Email</Label>
                <Input
                  placeholder="ईमेल / Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
                {submitAttempted && !emailValid && (
                  <p className="text-sm text-primary">कृपया वैध ईमेल पता दर्ज करें</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>लिंग / Gender</Label>
                <Select 
                  value={form.sex} 
                  onValueChange={(value) => {
                    setForm(prev => ({ ...prev, sex: value }))
                    setTouchedFields(prev => ({ ...prev, sex: true }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="लिंग चुनें / Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">पुरुष</SelectItem>
                    <SelectItem value="FEMALE">महिला</SelectItem>
                    <SelectItem value="OTHER">अन्य</SelectItem>
                    <SelectItem value="UNSPECIFIED">अनिर्दिष्ट</SelectItem>
                  </SelectContent>
                </Select>
                {(submitAttempted || touchedFields.sex) && !sexValid && (
                  <p className="text-sm text-primary">कृपया लिंग चुनें</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>पूरा पता / Full Address</Label>
                <Input
                  placeholder="पूरा पता / Full Address"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
                />
                {(submitAttempted || touchedFields.address) && !addressValid && (
                  <p className="text-sm text-primary">पता कम से कम 10 अक्षरों का होना चाहिए</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>रक्त गट / Blood Group</Label>
                <Input
                  placeholder="रक्त गट / Blood Group"
                  
                />
              </div>

              <div className="space-y-2">
                <Label>कोई विशेष उल्लेखनीय जानकारी ( प्रतिभा , सामाजिक भूमिका आदि )</Label>
                <Input
                  placeholder="कोई विशेष उल्लेखनीय जानकारी ( प्रतिभा , सामाजिक भूमिका आदि ) डालें"
                  value={form.vishesh}
                  onChange={(e) => setForm(prev => ({ ...prev, vishesh: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">प्रश्न</Label>
                <p>संघ एक्सपोज़र - कृपया केवल एक विकल्प चुनें</p>
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                >
                  {questions.map((question, index) => (
                    <div key={index} className="space-y-2 border rounded-lg p-3">
                      <Label className="text-sm font-medium">{question}</Label>
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={`${index}-yes`} id={`yes-${index}`} />
                          <Label htmlFor={`yes-${index}`}>हाँ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={`${index}-no`} id={`no-${index}`} />
                          <Label htmlFor={`no-${index}`}>नहीं</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {submitAttempted && !selectedAnswer && (
                  <p className="text-sm text-primary">कृपया एक विकल्प चुनें</p>
                )}
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <div className="space-y-2">
                <Label>किस प्रकार के कार्य के लिए उपयुक्त हो सकते हैं (संघ कार्य / विविध संगठन) ?</Label>
                <Input
                  placeholder="संघ कार्य / विविध संगठन"
                  value={form.upyogita}
                  onChange={(e) => setForm(prev => ({ ...prev, upyogita: e.target.value }))}
                />
              </div>
              
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button 
            type="submit" 
            form="utsuk-form"
            className="w-full" 
            disabled={!isFormValid || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'सहेजा जा रहा है...' : 'जमा करें'}
          </Button>
        </div>
      </div>
    </div>
  )
}
