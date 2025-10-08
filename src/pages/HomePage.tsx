import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Layers, ArrowRight, Home, BookOpen, FileText, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function HomePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'parivar' | 'nishulk' | 'sashulk'>('overview')

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
              <h1 className="text-2xl font-bold text-primary">संपर्क सेतु</h1>
              <p className="text-sm text-muted-foreground">आपका व्यक्तिगत डैशबोर्ड</p>
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
            label="Dashboard" 
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
            label="निशुल्क" 
            active={activeTab === 'nishulk'}
            onClick={() => setActiveTab('nishulk')}
          />
          <NavTab 
            icon={<FileText className="h-4 w-4" />} 
            label="सशुल्क" 
            active={activeTab === 'sashulk'}
            onClick={() => setActiveTab('sashulk')}
          />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <ActionCard
                icon={<Users className="h-6 w-6" />}
                title="परिवार डेटा"
                subtitle="परिवार का विवरण संग्रह करें"
                onClick={() => navigate('/parivar')}
                color="bg-blue-100 text-blue-600"
              />
              <ActionCard
                icon={<UserPlus className="h-6 w-6" />}
                title="उत्सुक शक्ति"
                subtitle="नये उत्सुक सदस्य जोड़ें"
                onClick={() => navigate('/utsuk')}
                color="bg-purple-100 text-purple-600"
              />
              <ActionCard
                icon={<Layers className="h-6 w-6" />}
                title="टोली निर्माण"
                subtitle="टोली बनाएं"
                onClick={() => navigate('/toli')}
                color="bg-green-100 text-green-600"
              />
              <ActionCard
                icon={<Layers className="h-6 w-6" />}
                title="Create User"
                subtitle="create new user"
                onClick={() => navigate('/create')}
                color="bg-green-100 text-green-600"
              />
            </div>

            {/* Statistics Cards */}
            <div className="space-y-6">
              {/* Top Row - Teams and New Joins */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="कुल टोलिया"
                  value="24"
                  icon={<Users className="h-6 w-6" />}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard
                  title="नए जुड़े"
                  value="32"
                  icon={<UserPlus className="h-6 w-6" />}
                  color="bg-purple-100 text-purple-600"
                />
              </div>

              {/* Total Members Section */}
              <div>
                <h2 className="text-lg font-semibold text-primary mb-4">कुल सदस्य</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="कुल"
                    value="782"
                    icon={<Users className="h-6 w-6" />}
                    color="bg-green-100 text-green-600"
                  />
                  <StatCard
                    title="परिवार"
                    value="156"
                    icon={<Users className="h-6 w-6" />}
                    color="bg-blue-100 text-blue-600"
                  />
                </div>
              </div>

              {/* Books Section */}
              <div>
                <h2 className="text-lg font-semibold text-primary mb-4">पुस्तकें</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title="निशुल्क"
                    value="420"
                    icon={<BookOpen className="h-6 w-6" />}
                    color="bg-green-100 text-green-600"
                  />
                  <StatCard
                    title="सशुल्क"
                    value="235"
                    icon={<FileText className="h-6 w-6" />}
                    color="bg-orange-100 text-orange-600"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'parivar' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-primary mb-4">परिवार विवरण</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="कुल परिवार"
                value="156"
                icon={<Users className="h-6 w-6" />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="कुल सदस्य"
                value="782"
                icon={<Users className="h-6 w-6" />}
                color="bg-green-100 text-green-600"
              />
            </div>
            
            <h2 className="text-lg font-semibold text-primary mb-4">लिंगानुपात</h2>
            <div className="space-y-4">
              <StatCard
                title="पुरुष"
                value="412"
                icon={<Users className="h-6 w-6" />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="महिलाएं"
                value="320"
                icon={<Users className="h-6 w-6" />}
                color="bg-pink-100 text-pink-600"
              />
              <StatCard
                title="बच्चे"
                value="50"
                icon={<Users className="h-6 w-6" />}
                color="bg-purple-100 text-purple-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'nishulk' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-primary mb-4">निशुल्क साहित्य</h2>
            <div className="space-y-4">
              <StatCard
                title="कुल स्टीकर"
                value="1250"
                icon={<BookOpen className="h-6 w-6" />}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                title="कुल फोल्डर"
                value="680"
                icon={<BookOpen className="h-6 w-6" />}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="कुल पुस्तकें"
                value="420"
                icon={<BookOpen className="h-6 w-6" />}
                color="bg-purple-100 text-purple-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'sashulk' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-primary mb-4">सशुल्क साहित्य</h2>
            <div className="space-y-4">
              <StatCard
                title="कुल पुस्तकें"
                value="235"
                icon={<FileText className="h-6 w-6" />}
                color="bg-orange-100 text-orange-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Navigation Tab Component
function NavTab({ icon, label, active = false, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 relative transition-colors ${
        active 
          ? 'text-primary' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
      )}
    </button>
  )
}

// Action Card Component
function ActionCard({ icon, title, subtitle, onClick, color }: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string, 
  onClick: () => void, 
  color: string 
}) {
  return (
    <button 
      onClick={onClick} 
      className="group rounded-lg border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className={`inline-flex items-center justify-center rounded-md ${color} p-2 mb-3`}>
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-primary">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-0.5" />
      </div>
    </button>
  )
}

// Statistics Card Component
function StatCard({ title, value, icon, color }: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  color: string 
}) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground mb-1">{title}</div>
          <div className="text-3xl font-bold text-primary">{value}</div>
        </div>
        <div className={`inline-flex items-center justify-center rounded-lg ${color} p-3`}>
          {icon}
        </div>
      </div>
    </div>
  )
}


