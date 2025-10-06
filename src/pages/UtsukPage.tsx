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
import RegionSelector from '@/components/RegionSelector'
import { authService, personService } from '@/api/services'
import type { CreatePersonRequest } from '@/types'

export default function UtsukPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
   const [regionId, setRegionId] = useState<number | null>(null) 
  
  // Region states
  const [nagar, setNagar] = useState<string>('')
  
  // Form states
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    sex: '',
    address: '',
    vishesh: ''
  })
  
  // Questions
  const questions = [
    'क्या आप संघ के कार्यक्रमों में भाग लेते हैं?',
    'क्या आप नियमित रूप से शाखा में जाते हैं?',
    'क्या आप संघ के साहित्य पढ़ते हैं?',
    'क्या आप संघ के कार्यों में सहयोग करना चाहते हैं?'
  ]
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''))
  
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
  const questionsValid = answers.every(answer => answer !== '')
  
  const isFormValid = nameValid && phoneValid && emailValid && sexValid && addressValid && questionsValid

   useEffect(() => {
     getUserRegion()
    }, [])

  const getUserRegion = async () => {
      try {
        const userRegion = await authService.getCurrentUser()
        if (userRegion.success && userRegion.data) {
          setRegionId(userRegion.data.region_id)     
        }
      } catch (error) {
        console.error('Error fetching user region:', error)
      }
        }

  // Debug logging
  console.log('Form validation:', {
    nameValid,
    phoneValid,
    emailValid,
    sexValid,
    addressValid,
    questionsValid,
    isFormValid
  })

  // Handle region changes from RegionSelector
  const handleRegionChange = (_prantValue: string, _vibhagValue: string, _jilaValue: string, nagarValue: string) => {
    setNagar(nagarValue)
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
        answers: answers.reduce((acc, answer, index) => {
          acc[`question_${index + 1}`] = answer
          return acc
        }, {} as Record<string, string>)
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
      setForm({ name: '', phone: '', email: '', sex: '', address: '', vishesh: '' })
      setAnswers(Array(questions.length).fill(''))
      setNagar('')
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
              <CardTitle className="text-xl text-center">उत्सुक शक्ति</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="utsuk-form" onSubmit={handleSubmit} className="space-y-4">
              <RegionSelector 
                onRegionChange={handleRegionChange}
                disabled={isLoading}
              />

              <div className="space-y-2">
                <Label>नाम</Label>
                <Input
                  placeholder="नाम"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                />
                {(submitAttempted || touchedFields.name) && !nameValid && (
                  <p className="text-sm text-primary">नाम कम से कम 3 अक्षरों का होना चाहिए</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>मोबाइल नंबर</Label>
                <Input
                  placeholder="मोबाइल नंबर"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                />
                {submitAttempted && !phoneValid && (
                  <p className="text-sm text-primary">कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>ईमेल</Label>
                <Input
                  placeholder="ईमेल"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
                {submitAttempted && !emailValid && (
                  <p className="text-sm text-primary">कृपया वैध ईमेल पता दर्ज करें</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>लिंग</Label>
                <Select 
                  value={form.sex} 
                  onValueChange={(value) => {
                    setForm(prev => ({ ...prev, sex: value }))
                    setTouchedFields(prev => ({ ...prev, sex: true }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="लिंग चुनें" />
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
                <Label>पता</Label>
                <Input
                  placeholder="पता"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  onBlur={() => setTouchedFields(prev => ({ ...prev, address: true }))}
                />
                {(submitAttempted || touchedFields.address) && !addressValid && (
                  <p className="text-sm text-primary">पता कम से कम 10 अक्षरों का होना चाहिए</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>विशेषता</Label>
                <Input
                  placeholder="विशेषता"
                  value={form.vishesh}
                  onChange={(e) => setForm(prev => ({ ...prev, vishesh: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">प्रश्न</Label>
                {questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">{question}</Label>
                    <RadioGroup
                      value={answers[index]}
                      onValueChange={(value: string) => {
                        const newAnswers = [...answers]
                        newAnswers[index] = value
                        setAnswers(newAnswers)
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`yes-${index}`} />
                        <Label htmlFor={`yes-${index}`}>हाँ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`no-${index}`} />
                        <Label htmlFor={`no-${index}`}>नहीं</Label>
                      </div>
                    </RadioGroup>
                    {submitAttempted && !answers[index] && (
                      <p className="text-sm text-primary">कृपया एक विकल्प चुनें</p>
                    )}
                  </div>
                ))}
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