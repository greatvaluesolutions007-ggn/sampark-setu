import { Home, BookOpen, FileText, LogOut, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { authService } from '@/api/services'
import NavTab from '@/components/NavTab'
import OverviewTab from '@/components/OverviewTab'
import SahityaTab from '@/components/SahityaTab'
import DetailsCard, { type DetailsCardData } from '@/components/DetailsCard'

export default function HomePage() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'parivar' | 'nishulk' | 'utsuk' | 'sashulk'>('overview')
  const [detailsCardData, setDetailsCardData] = useState<DetailsCardData | null>(null)
  const isDashboard = ['BASTI_KARYAKARTA', 'GRAM_KARYAKARTA'].includes(user?.role ?? '')

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
          } else if (userRegion.data.role === 'NAGAR_KARYAKARTA') {
            // NAGAR_KARYAKARTA: Prant -> Vibhag -> Jila -> Nagar
            if (details.nagar) hierarchy.push(`नगर: ${details.nagar.name}`)
          } else if (userRegion.data.role === 'JILA_KARYAKARTA') {
            // JILA_KARYAKARTA: Prant -> Vibhag -> Jila
            // Already included above
          } else if (userRegion.data.role === 'VIBHAG_KARYAKARTA') {
            // VIBHAG_KARYAKARTA: Prant -> Vibhag
            // Already included above
          } else if (userRegion.data.role === 'PRANT_KARYAKARTA') {
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
          setUserRole(roleDisplayNames[userRegion.data.role] || userRegion.data.role)
        }
      }
    } catch (error) {
      console.error('Error fetching user region:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-orange-50/40 to-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-orange-50 via-orange-50/40 to-white backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
          {/* Header */}
          <header>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-3">
                <img src="https://www.rss.org//images/ico_2205.ico" alt="RSS" className="h-8 w-8" />
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">संघ शताब्दी व्यापक गृह संपर्क अभियान (हरियाणा)</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">व्यक्तिगत डैशबोर्ड</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center gap-2 self-start sm:self-auto"
              >
                <LogOut className="h-4 w-4" />
                लॉगआउट
              </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="w-full flex border-b border-gray-200 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <div className="flex w-full space-x-0">
                <NavTab
                  icon={<Home className="h-4 w-4" />}
                  label='टोली जानकारी'
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <NavTab
                  icon={<Users className="h-4 w-4" />}
                  label="सम्पर्कित परिवार जानकारी"
                  active={activeTab === 'parivar'}
                  onClick={() => setActiveTab('parivar')}
                />
                <NavTab
                  icon={<BookOpen className="h-4 w-4" />}
                  label="उत्सुक शक्ति जानकारी"
                  active={activeTab === 'utsuk'}
                  onClick={() => setActiveTab('utsuk')}
                />
                <NavTab
                  icon={<FileText className="h-4 w-4" />}
                  label="साहित्य जानकारी"
                  active={activeTab === 'sashulk'}
                  onClick={() => setActiveTab('sashulk')}
                />
              </div>
            </div>

            {/* Details Card - Only show for hierarchical views */}
            {detailsCardData && ['overview', 'parivar', 'utsuk'].includes(activeTab) && (
              <div className="mt-4">
                <DetailsCard {...detailsCardData} />
              </div>
            )}
          </header>
        </div>
      </div>

      {/* Content */}
      <div 
        className="max-w-4xl mx-auto px-3 sm:px-4 py-6" 
      >
        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab user={user} activeTab="overview" onDetailsCardChange={setDetailsCardData} />}
        {activeTab === 'parivar' && <OverviewTab user={user} activeTab="parivar" onDetailsCardChange={setDetailsCardData} />}
        {activeTab === 'utsuk' && <OverviewTab user={user} activeTab="utsuk" onDetailsCardChange={setDetailsCardData} />}
        {activeTab === 'sashulk' && <SahityaTab />}
      </div>
    </div>
  )
}


