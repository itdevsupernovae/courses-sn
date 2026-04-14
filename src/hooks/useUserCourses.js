import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useUserCourses() {
  const { user } = useAuth()
  const [userCourses, setUserCourses] = useState([]) // array of user_courses rows
  const [loading, setLoading] = useState(true)

  const fetchUserCourses = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', user.id)
    setUserCourses(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchUserCourses()
  }, [fetchUserCourses])

  function getCourseStatus(courseId) {
    const record = userCourses.find(uc => uc.course_id === courseId)
    if (!record) return { status: 'not_started', record: null }
    if (!record.finished_at) return { status: 'in_progress', record }
    return { status: 'completed', record }
  }

  async function startCourse(courseId) {
    if (!user) return
    const existing = userCourses.find(uc => uc.course_id === courseId)
    if (existing) return // already started

    const { data } = await supabase
      .from('user_courses')
      .insert({ user_id: user.id, course_id: courseId })
      .select()
      .single()

    if (data) setUserCourses(prev => [...prev, data])
  }

  async function finishCourse(courseId) {
    if (!user) return
    const existing = userCourses.find(uc => uc.course_id === courseId)
    if (!existing || existing.finished_at) return

    const { data } = await supabase
      .from('user_courses')
      .update({ finished_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (data) {
      setUserCourses(prev => prev.map(uc => uc.id === data.id ? data : uc))
    }
    return data
  }

  return { userCourses, loading, getCourseStatus, startCourse, finishCourse, refetch: fetchUserCourses }
}
