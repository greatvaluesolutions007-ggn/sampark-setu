import HierarchicalTreeView from '@/components/HierarchicalTreeView'
import type { User } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface ParivarViewProps {
  user: User | null
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

export default function ParivarView({ user, onDetailsCardChange }: ParivarViewProps) {
  return <HierarchicalTreeView user={user} dataType="parivar" onDetailsCardChange={onDetailsCardChange} />
}