interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
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

