import HierarchicalTreeView from '@/components/HierarchicalTreeView'
import type { User } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface UtsukViewProps {
  user: User | null
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

export default function UtsukView({ user, onDetailsCardChange }: UtsukViewProps) {
  return <HierarchicalTreeView user={user} dataType="utsuk" onDetailsCardChange={onDetailsCardChange} />
}