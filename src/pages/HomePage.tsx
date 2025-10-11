import { Home, BookOpen, FileText, LogOut, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import NavTab from '@/components/NavTab'
import OverviewTab from '@/components/OverviewTab'
import ParivarTab from '@/components/ParivarTab'
import UtsukTab from '@/components/UtsukTab'
import SahityaTab from '@/components/SahityaTab'

export default function HomePage() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'parivar' | 'nishulk' | 'utsuk' | 'sashulk'>('overview')
  const isDashboard = ['BASTI_KARYAKARTA', 'GRAM_KARYAKARTA'].includes(user?.role ?? '')

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-orange-50/40 to-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-orange-50 via-orange-50/40 to-white backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="https://www.rss.org//images/ico_2205.ico" alt="RSS" className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold text-primary">संघ शताब्दी व्यापक गृह संपर्क अभियान (हरियाणा)</h1>
                <p className="text-sm text-muted-foreground">व्यक्तिगत डैशबोर्ड</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              लॉगआउट
            </Button>
          </header>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <NavTab
              icon={<Home className="h-4 w-4" />}
              label={isDashboard ? 'डैशबोर्ड' : 'टोली जानकरी'}
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <NavTab
              icon={<Users className="h-4 w-4" />}
              label="परिवार"
              active={activeTab === 'parivar'}
              onClick={() => setActiveTab('parivar')}
            />
            <NavTab
              icon={<BookOpen className="h-4 w-4" />}
              label="उत्सुक शक्ति"
              active={activeTab === 'utsuk'}
              onClick={() => setActiveTab('utsuk')}
            />
            <NavTab
              icon={<FileText className="h-4 w-4" />}
              label="साहित्य"
              active={activeTab === 'sashulk'}
              onClick={() => setActiveTab('sashulk')}
            />

            <NavTab
              icon={<Users className="h-4 w-4" />}
              label="परिवार"
              active={activeTab === 'parivar'}
              onClick={() => setActiveTab('parivar')}
            />
            <NavTab
              icon={<BookOpen className="h-4 w-4" />}
              label="उत्सुक शक्ति"
              active={activeTab === 'utsuk'}
              onClick={() => setActiveTab('utsuk')}
            />
            <NavTab
              icon={<FileText className="h-4 w-4" />}
              label="साहित्य"
              active={activeTab === 'sashulk'}
              onClick={() => setActiveTab('sashulk')}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'parivar' && <ParivarTab />}
        {activeTab === 'utsuk' && <UtsukTab />}
        {activeTab === 'sashulk' && <SahityaTab />}
      </div>
    </div>
  )
}
