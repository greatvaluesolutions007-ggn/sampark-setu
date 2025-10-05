import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import HierarchicalRegionDropdown from '@/components/HierarchicalRegionDropdown'
import { authService } from '@/api'
import { ArrowLeft } from 'lucide-react'
import type { CreateUserRequest } from '@/types'

export default function CreatePage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // State management for form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regionName, setRegionName] = useState('')
  const [regionType, setRegionType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'PRANT_KARYAKARTA' | 'VIBHAG_KARYAKARTA' | 'JILA_KARYAKARTA' | 'NAGAR_KARYAKARTA'>()

  // Fetch current user's role on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        if (response.success && response.data) {
          setCurrentUserRole(response.data.role as 'ADMIN' | 'PRANT_KARYAKARTA' | 'VIBHAG_KARYAKARTA' | 'JILA_KARYAKARTA' | 'NAGAR_KARYAKARTA')
        }
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }
    fetchCurrentUser()
  }, [])

  // Handle region changes from HierarchicalRegionDropdown
  const handleRegionChange = (selectedRegionId: number, selectedRegionName: string, selectedRegionType: string) => {
    console.log('CreatePage - Region selected:', { selectedRegionId, selectedRegionName, selectedRegionType })
    setRegionName(selectedRegionName)
    setRegionType(selectedRegionType)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password || !regionType) {
      setError('All fields are required.')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      // Map regionType to proper role and region ID
      const getRegionIdFromType = (type: string): number => {
        switch (type.toUpperCase()) {
          case 'PRANT':
            return 1
          case 'VIBHAG':
            return 2
          case 'JILA':
            return 3
          case 'NAGAR':
            return 4
          default:
            return 0
        }
      }

      // Get role directly from region type
      const role = `${regionType.toUpperCase()}_KARYAKARTA` as 'PRANT_KARYAKARTA' | 'VIBHAG_KARYAKARTA' | 'JILA_KARYAKARTA' | 'NAGAR_KARYAKARTA'

      const requestBody: CreateUserRequest = { 
        user_name: email, 
        password: password, 
        region_id: getRegionIdFromType(regionType), 
        role: role
       }

      const response = await authService.createUser(requestBody)

      if (!response.success) {
        throw new Error(response.message || 'Failed to create user')
      }

      toast({
        title: "Success!",
        description: `User created successfully for region: ${regionName}`,
      })

      // Reset form on success
      setEmail('')
      setPassword('')
      setRegionName('')
      setRegionType('')
       toast({
        title: "उपयोगकर्ता सफलतापूर्वक बनाया गया",
        description: `उपयोगकर्ता सफलतापूर्वक बनाया गया ${regionName} के लिए`,
      })

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/')
      }, 1500)


    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-2xl mx-auto py-6">.
           <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> वापस जाएँ
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Create User</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="create-form" onSubmit={handleSubmit} className="space-y-4">
                <HierarchicalRegionDropdown 
                  onRegionChange={handleRegionChange}
                  userRole={currentUserRole}
                  disabled={!currentUserRole}
                />

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                
                {/* Display selected region information */}
              
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <Button type="submit" form="create-form" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </div>
  )
}