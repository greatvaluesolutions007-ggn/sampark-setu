import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginRequest } from '@/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [touchedUsername, setTouchedUsername] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const usernameValid = username.trim().length >= 3 && !/\s/.test(username)
  const passwordValid = password.trim().length >= 6
  const isFormValid = usernameValid && passwordValid


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)
    setError('')
    
    if (!isFormValid) return
    
    setIsLoading(true)
    try {
      const credentials: LoginRequest = {
        user_name: username,
        password: password
      }
      
      const response = await authService.login(credentials)
      
      // Debug: print response here
      console.log('Login response:', response)
      
      // Check if the response is successful
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      
      // Validate response data exists
      if (!response.data) {
        throw new Error('Invalid response data received')
      }
      
      // Store additional user info
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', response.data.role)
      localStorage.setItem('regionId', response.data.region_id?.toString() || '')
      
      // Update auth context
      await login(username)
      
      navigate('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'लॉगिन में त्रुटि हुई। कृपया पुनः प्रयास करें।'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">ॐ</div>
          <CardTitle className="text-2xl font-bold">शताब्दी गृह सम्पर्क</CardTitle>
          <p className="text-sm text-muted-foreground">संघ शताब्दी व्यापक गृह सम्पर्क अभियान हरियाणा प्रान्त</p>
          <p className="text-sm text-muted-foreground">30 नवम्बर - 21 दिसम्बर</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">लॉगिन</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">उपयोगकर्ता नाम / Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <Input id="username" type="text" placeholder="अपका उपयोगकर्ता नाम दर्ज करें" value={username} onChange={(e) => setUsername(e.target.value)} onBlur={() => setTouchedUsername(true)} className="pl-9" />
                  </div>
                  {(touchedUsername || submitAttempted) && !usernameValid && (
                    <p className="text-sm text-primary">
                      {username.trim().length < 3 ? 'उपयोगकर्ता नाम कम से कम 3 अक्षरों का होना चाहिए' : 'उपयोगकर्ता नाम में स्पेस नहीं हो सकते'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">पासवर्ड / Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="अपका पासवर्ड दर्ज करें (कम से कम 6 अक्षर)" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" aria-label={showPassword ? 'पासवर्ड छुपाएँ' : 'पासवर्ड दिखाएँ'} onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {submitAttempted && !passwordValid && <p className="text-sm text-primary">पासवर्ड कम से कम 6 अक्षरों का होना चाहिए</p>}
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-95" disabled={!isFormValid || isLoading}>
                  {isLoading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              नया खाता बनाना चाहते हैं?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                पंजीकरण करें
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


