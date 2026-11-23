import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { formatCourseDate } from '@/lib/catalog'
import type { Product } from '@/types/product'

function MetadataRow({ icon, label, children }: { icon: 'user' | 'cal' | 'users'; label: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
      <span className="flex h-lh items-center text-brand"><Icon name={icon} size={16} /></span>
      <p className="wrap-break-word"><strong className="font-semibold">{label}:</strong>{' '}<span>{children}</span></p>
    </li>
  )
}

export function ProductMetadata({ product }: { product: Product }) {
  const course = product.kind === 'course'
  return (
    <ul aria-label="Informazioni sul prodotto" className="mt-4 space-y-2 text-sm">
      <MetadataRow icon="user" label={course ? 'Docente' : 'Autore/Autrice'}>{product.creator}</MetadataRow>
      <MetadataRow icon={course ? 'cal' : 'users'} label={course ? 'Inizio' : 'Età'}>
        {course ? <time dateTime={product.startDate}>{formatCourseDate(product.startDate)}</time> : product.ageRange}
      </MetadataRow>
    </ul>
  )
}
