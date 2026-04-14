import { useTranslation } from 'react-i18next'

const FILTERS = ['all', 'Environnement', 'Security', 'Genrer']

export default function FilterPills({ active, onChange }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`pill ${active === f ? 'pill-active' : 'pill-inactive'}`}
        >
          {t(`courses.filters.${f}`, f === 'all' ? t('courses.filters.all') : f)}
        </button>
      ))}
    </div>
  )
}
