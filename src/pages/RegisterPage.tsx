import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/api/services'
import { useToast } from '@/hooks/use-toast'
import HierarchicalRegionDropdown from '@/components/HierarchicalRegionDropdown'
import type { ValidateCodeRequest, CreateUserWithCodeRequest } from '@/types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Step management
  const [step, setStep] = useState<'code' | 'details'>('code')
  
  // Code validation state
  const [code, setCode] = useState('')
  const [accessLevel, setAccessLevel] = useState<'TOLI_CREATION' | 'VIEW_ONLY' | null>(null)
  
  // User details state
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [sangh, setSangh] = useState('')
  const [totalHouse, setTotalHouse] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Region state
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null)
  const [selectedRegionType, setSelectedRegionType] = useState<string | null>(null)
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [touchedFields, setTouchedFields] = useState({
    code: false,
    fullName: false,
    username: false,
    password: false,
    confirmPassword: false,
    mobileNumber: false,
    sangh: false,
    totalHouse: false
  })

  // Validation functions
  const codeValid = code.length === 4 && /^\d{4}$/.test(code) && (code === '1925' || code === '2025')
  const fullNameValid = fullName.trim().length >= 2
  const usernameValid = username.length >= 3 && !/\s/.test(username)
  const passwordValid = password.length >= 6
  const confirmPasswordValid = password === confirmPassword && confirmPassword.length > 0
  const mobileNumberValid = /^[6-9]\d{9}$/.test(mobileNumber)
  const sanghValid = sangh.trim().length === 0 || /^[a-zA-Z\u0900-\u097F\s]+$/.test(sangh.trim())
  const totalHouseValid = totalHouse.trim().length === 0 || /^\d+$/.test(totalHouse.trim())
  const regionValid = selectedRegionId !== null && (
    code !== '1925' || 
    (selectedRegionType === 'BASTI' || selectedRegionType === 'GRAM')
  )
  
  const isCodeFormValid = codeValid
  const isDetailsFormValid = fullNameValid && usernameValid && passwordValid && confirmPasswordValid && mobileNumberValid && sanghValid && totalHouseValid && regionValid

  // Handle code validation
  async function handleCodeValidation(e: React.FormEvent) {
    e.preventDefault()
    setTouchedFields(prev => ({ ...prev, code: true }))
    
    if (!isCodeFormValid) {
      setError('कृपया वैध कोड दर्ज करें (1925 या 2025)')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const validateRequest: ValidateCodeRequest = { user_code: code }
      const response = await authService.validateCode(validateRequest)

      if (response.success && response.data.is_valid) {
        setAccessLevel(response.data.access_level)
        setStep('details')
        
        toast({
          title: "कोड सत्यापित",
          description: response.data.message,
          variant: "default"
        })
      } else {
        setError(response.data?.message || 'अमान्य कोड')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'कोड सत्यापन में त्रुटि'
      setError(errorMessage)
      console.error('Code validation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle user registration
  async function handleRegistration(e: React.FormEvent) {
    e.preventDefault()
    setTouchedFields(prev => ({ 
      ...prev, 
      fullName: true,
      username: true, 
      password: true, 
      confirmPassword: true,
      mobileNumber: true,
      sangh: true,
      totalHouse: true
    }))
    
    if (!isDetailsFormValid) {
      setError('कृपया सभी फ़ील्ड भरें')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const registerRequest: CreateUserWithCodeRequest = {
        user_code: code,
        user_name: username,
        password: password,
        full_name: fullName,
        mobile_number: mobileNumber,
        region_id: selectedRegionId!,
        sangh: sangh.trim() || undefined,
        total_house: totalHouse.trim() ? parseInt(totalHouse, 10) : undefined
      }

      const response = await authService.createUserWithCode(registerRequest)

      if (response.success) {
        toast({
          title: "पंजीकरण सफल",
          description: "आपका खाता सफलतापूर्वक बनाया गया है",
          variant: "default"
        })
        
        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setError(response.message || 'पंजीकरण में त्रुटि')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'पंजीकरण में त्रुटि'
      setError(errorMessage)
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle region selection
  const handleRegionChange = (regionId: number, regionName: string, regionType: string) => {
    setSelectedRegionId(regionId)
    setSelectedRegionType(regionType)
    console.log('Region selected:', { regionId, regionName, regionType })
  }

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step === 'details') {
                  setStep('code')
                } else {
                  navigate('/login')
                }
              }}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-600">
            <p>{step === 'code' ? 'कोड दर्ज करें' : 'पंजीकरण करें'} {" "} {code==="1925" ? "(टोली प्रयोग हेतु)" : "(डैशबोर्ड देखने हेतु)"}</p>
          </CardTitle>
          <p className="text-gray-600">
            {step === 'code' 
              ? 'अपना 4 अंकों का एक्सेस कोड दर्ज करें'
              : 'अपनी जानकारी भरें'
            }
          </p>
        </CardHeader>
        
        <CardContent>
          {step === 'code' ? (
            // Code validation form
            <form onSubmit={handleCodeValidation} className="space-y-4">
              <div>
                <Label htmlFor="code">एक्सेस कोड</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 4)
                    setCode(value)
                  }}
                  onBlur={() => handleFieldBlur('code')}
                  placeholder="कोड दर्ज करें"
                  maxLength={4}
                  className={`text-center text-lg tracking-widest ${
                    touchedFields.code && !codeValid ? 'border-red-500' : ''
                  }`}
                />
                {touchedFields.code && !codeValid && (
                  <p className="text-red-500 text-sm mt-1">वैध कोड दर्ज करें</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading || !isCodeFormValid}
              >
                {isLoading ? 'सत्यापित हो रहा है...' : 'कोड सत्यापित करें'}
              </Button>

            </form>
          ) : (
            // User registration form
            <form onSubmit={handleRegistration} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-600 text-sm">
                  ✓ कोड सत्यापित: {accessLevel === 'TOLI_CREATION' ? 'पूर्ण एक्सेस' : 'केवल देखने के लिए'}
                </p>
              </div>

              <div>
                <Label htmlFor="fullName">पूरा नाम / Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleFieldBlur('fullName')}
                  placeholder="अपना पूरा नाम दर्ज करें"
                  className={touchedFields.fullName && !fullNameValid ? 'border-red-500' : ''}
                />
                {touchedFields.fullName && !fullNameValid && (
                  <p className="text-red-500 text-sm mt-1">कम से कम 2 अक्षर का नाम दर्ज करें</p>
                )}
              </div>

              <div>
                <Label htmlFor="username">उपयोगकर्ता नाम / Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleFieldBlur('username')}
                  placeholder="अपना उपयोगकर्ता नाम दर्ज करें"
                  className={touchedFields.username && !usernameValid ? 'border-red-500' : ''}
                />
                {touchedFields.username && !usernameValid && (
                  <p className="text-red-500 text-sm mt-1">
                    {username.length < 3 ? 'कम से कम 3 अक्षर का नाम दर्ज करें' : 'उपयोगकर्ता नाम में स्पेस नहीं हो सकते'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">पासवर्ड / Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleFieldBlur('password')}
                    placeholder="पासवर्ड दर्ज करें"
                    className={touchedFields.password && !passwordValid ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {touchedFields.password && !passwordValid && (
                  <p className="text-red-500 text-sm mt-1">कम से कम 6 अक्षर का पासवर्ड दर्ज करें</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">पासवर्ड की पुष्टि करें / Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleFieldBlur('confirmPassword')}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                    className={touchedFields.confirmPassword && !confirmPasswordValid ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {touchedFields.confirmPassword && !confirmPasswordValid && (
                  <p className="text-red-500 text-sm mt-1">पासवर्ड मेल नहीं खा रहा</p>
                )}
              </div>

              <div>
                <Label htmlFor="mobileNumber">मोबाइल नंबर / Mobile No.</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setMobileNumber(value)
                  }}
                  onBlur={() => handleFieldBlur('mobileNumber')}
                  placeholder="मोबाइल नंबर दर्ज करें"
                  maxLength={10}
                  className={touchedFields.mobileNumber && !mobileNumberValid ? 'border-red-500' : ''}
                />
                {touchedFields.mobileNumber && !mobileNumberValid && (
                  <p className="text-red-500 text-sm mt-1">वैध मोबाइल नंबर दर्ज करें (10 अंक)</p>
                )}
              </div>

             {code==='1925'&& <div>
                <Label htmlFor="sangh">संघ / विविध क्षेत्र का दायित्व (यदि है)</Label>
                <Input
                  id="sangh"
                  type="text"
                  value={sangh}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow text characters (letters and spaces), no numbers
                    if (/^[a-zA-Z\u0900-\u097F\s]*$/.test(value)) {
                      setSangh(value)
                    }
                  }}
                  onBlur={() => handleFieldBlur('sangh')}
                  placeholder="संघ / विविध क्षेत्र का दायित्व (यदि है) तो दर्ज करे"
                  className={touchedFields.sangh && !sanghValid ? 'border-red-500' : ''}
                />
                {touchedFields.sangh && !sanghValid && (
                  <p className="text-red-500 text-sm mt-1">केवल अक्षर और स्पेस दर्ज करें, संख्या नहीं</p>
                )}
              </div>}

              {code ==='1925' && <div>
                <Label htmlFor="totalHouse">कुल लक्षित घर / परिवार</Label>
                <Input
                  id="totalHouse"
                  type="text"
                  value={totalHouse}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setTotalHouse(value)
                  }}
                  onBlur={() => handleFieldBlur('totalHouse')}
                  placeholder="कुल लक्षित घर / परिवार दर्ज करे"
                  className={touchedFields.totalHouse && !totalHouseValid ? 'border-red-500' : ''}
                />
                {touchedFields.totalHouse && !totalHouseValid && (
                  <p className="text-red-500 text-sm mt-1">केवल संख्या दर्ज करें</p>
                )}
              </div>}

              <div>
                {/* <Label>क्षेत्र चुनें</Label> */}
                <HierarchicalRegionDropdown
                  onRegionChange={handleRegionChange}
                  accessLevel={accessLevel}
                />
                {!regionValid && selectedRegionId === null && (
                  <p className="text-red-500 text-sm mt-1">कृपया अपना क्षेत्र चुनें</p>
                )}
                {!regionValid && selectedRegionId !== null && code === '1925' && (
                  <p className="text-red-500 text-sm mt-1">कृपया BASTI या GRAM क्षेत्र चुनें</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading || !isDetailsFormValid}
              >
                {isLoading ? 'पंजीकरण हो रहा है...' : 'पंजीकरण करें'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              पहले से खाता है?{' '}
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
