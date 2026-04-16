import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCourses(typeFilter, userId) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      const { data } = await query
      setCourses(data || [])
      setLoading(false)
    }
    fetch()
  }, [typeFilter, userId])

  return { courses, loading, setCourses }
}
