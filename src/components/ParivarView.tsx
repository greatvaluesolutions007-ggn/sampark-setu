import HierarchicalTreeView from '@/components/HierarchicalTreeView'
import ParivarListView from '@/components/ParivarListView'
import type { User } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface ParivarViewProps {
  user: User | null
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

export default function ParivarView({ user, onDetailsCardChange }: ParivarViewProps) {
  // Only show list view for BASTI_KARYAKARTA and GRAM_KARYAKARTA (ground level data entry users)
  const isDataEntryUser = ['BASTI_KARYAKARTA', 'GRAM_KARYAKARTA'].includes(user?.role ?? '')
  
  if (isDataEntryUser) {
    return <ParivarListView user={user} />
  }
  
  // For other user types, show hierarchical/aggregated view
  return <HierarchicalTreeView user={user} dataType="parivar" onDetailsCardChange={onDetailsCardChange} />
}