import HierarchicalTreeView from '@/components/HierarchicalTreeView'
import type { User } from '@/types'
import type { DetailsCardData } from '@/components/DetailsCard'

interface ToliViewProps {
  user: User | null
  onDetailsCardChange?: (detailsCardData: DetailsCardData) => void
}

export default function ToliView({ user, onDetailsCardChange }: ToliViewProps) {
  return <HierarchicalTreeView user={user} dataType="toli" onDetailsCardChange={onDetailsCardChange} />
}