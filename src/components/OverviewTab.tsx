import Dashboard from '@/components/Dashboard'
import ToliView from '@/components/ToliView'
import ParivarView from '@/components/ParivarView'
import UtsukView from '@/components/UtsukView'
import type { User } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface OverviewTabProps {
  user: User | null
  activeTab?: 'overview' | 'parivar' | 'utsuk'
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

export default function OverviewTab({ user, activeTab = 'overview', onDetailsCardChange }: OverviewTabProps) {
  const isDashboard = ['BASTI_KARYAKARTA', 'GRAM_KARYAKARTA'].includes(user?.role ?? '')

  if (isDashboard) {
    return <Dashboard />
  }

  // For non-dashboard users, show appropriate view based on active tab
  switch (activeTab) {
    case 'parivar':
      return <ParivarView user={user} onDetailsCardChange={onDetailsCardChange} />
    case 'utsuk':
      return <UtsukView user={user} onDetailsCardChange={onDetailsCardChange} />
    case 'overview':
    default:
      return <ToliView user={user} onDetailsCardChange={onDetailsCardChange} />
  }
}

