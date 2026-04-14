import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function deleteCourse(id) {
    await supabase.from('courses').delete().eq('id', id)
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  async function updateCourse(id, updates) {
    const { data } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setCourses(prev => prev.map(c => c.id === data.id ? data : c))
  }

  return { courses, loading, refetch: fetch, deleteCourse, updateCourse }
}

export function useAdminUserProgress() {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from('user_courses')
        .select('*, profiles(first_name, last_name, email), courses(title, type)')
        .order('started_at', { ascending: false })
      setProgress(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { progress, loading }
}
