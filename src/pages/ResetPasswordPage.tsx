import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/api/services'
import { useToast } from '@/hooks/use-toast'
import type { ResetPasswordRequest } from '@/types'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    phoneNumber: false,
    newPassword: false,
    confirmPassword: false
  })

  // Validation functions
  const usernameValid = username.trim().length >= 3 && !/\s/.test(username)
  const phoneNumberValid = /^[6-9]\d{9}$/.test(phoneNumber)
  const newPasswordValid = newPassword.length >= 6
  const confirmPasswordValid = newPassword === confirmPassword && confirmPassword.length > 0
  
  const isFormValid = usernameValid && phoneNumberValid && newPasswordValid && confirmPasswordValid

  const handleFieldBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouchedFields({
      username: true,
      phoneNumber: true,
      newPassword: true,
      confirmPassword: true
    })
    setError('')
    
    if (!isFormValid) {
      setError('कृपया सभी फ़ील्ड सही तरीके से भरें')
      return
    }
    
    setIsLoading(true)
    try {
      const resetData: ResetPasswordRequest = {
        user_name: username,
        phone_number: phoneNumber,
        new_password: newPassword
      }
      
      const response = await authService.resetPassword(resetData)
      
      if (response.success) {
        toast({
          title: "पासवर्ड रीसेट सफल",
          description: response.message || "आपका पासवर्ड सफलतापूर्वक बदल दिया गया है",
          variant: "default"
        })
        
        // Navigate to login page after successful reset
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setError(response.message || 'पासवर्ड रीसेट में त्रुटि')
      }
    } catch (err: unknown) {
      let errorMessage = 'पासवर्ड रीसेट में त्रुटि हुई। कृपया पुनः प्रयास करें।'
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              message?: string
              error_message?: string
            } 
          } 
        }
        
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data
          errorMessage = errorData.error_message || 
                        errorData.message || 
                        errorMessage
        }
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">ॐ</div>
          <CardTitle className="text-2xl font-bold">पासवर्ड रीसेट करें</CardTitle>
          <p className="text-sm text-muted-foreground">अपना पासवर्ड बदलने के लिए जानकारी दर्ज करें</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">उपयोगकर्ता नाम / Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="अपका उपयोगकर्ता नाम दर्ज करें"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleFieldBlur('username')}
                className={touchedFields.username && !usernameValid ? 'border-red-500' : ''}
              />
              {touchedFields.username && !usernameValid && (
                <p className="text-sm text-primary">
                  {username.trim().length < 3 ? 'उपयोगकर्ता नाम कम से कम 3 अक्षरों का होना चाहिए' : 'उपयोगकर्ता नाम में स्पेस नहीं हो सकते'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">मोबाइल नंबर / Mobile Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="मोबाइल नंबर दर्ज करें (10 अंक)"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhoneNumber(value)
                }}
                onBlur={() => handleFieldBlur('phoneNumber')}
                maxLength={10}
                className={touchedFields.phoneNumber && !phoneNumberValid ? 'border-red-500' : ''}
              />
              {touchedFields.phoneNumber && !phoneNumberValid && (
                <p className="text-sm text-primary">वैध मोबाइल नंबर दर्ज करें (10 अंक, 6-9 से शुरू होना चाहिए)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">नया पासवर्ड / New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="नया पासवर्ड दर्ज करें (कम से कम 6 अक्षर)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => handleFieldBlur('newPassword')}
                  className={touchedFields.newPassword && !newPasswordValid ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? 'पासवर्ड छुपाएँ' : 'पासवर्ड दिखाएँ'}
                  onClick={() => setShowNewPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touchedFields.newPassword && !newPasswordValid && (
                <p className="text-sm text-primary">पासवर्ड कम से कम 6 अक्षरों का होना चाहिए</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">पासवर्ड की पुष्टि करें / Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  className={touchedFields.confirmPassword && !confirmPasswordValid ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'पासवर्ड छुपाएँ' : 'पासवर्ड दिखाएँ'}
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touchedFields.confirmPassword && !confirmPasswordValid && (
                <p className="text-sm text-primary">पासवर्ड मेल नहीं खा रहा</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:opacity-95"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'पासवर्ड रीसेट हो रहा है...' : 'पासवर्ड रीसेट करें'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              पासवर्ड याद है?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                लॉग इन करें
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

