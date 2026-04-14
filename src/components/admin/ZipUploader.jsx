import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileArchive, CheckCircle2 } from 'lucide-react'
import JSZip from 'jszip'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function ZipUploader({ folderName, onSuccess }) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.zip')) setFile(dropped)
  }

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected?.name.endsWith('.zip')) setFile(selected)
  }

  async function processZip({ title, subtitle, type } = {}) {
    if (!file || !folderName) return null

    setUploading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      const fileEntries = []
      const promises = []

      zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          promises.push(
            zipEntry.async('base64').then(content => {
              fileEntries.push({ path: relativePath, content })
            })
          )
        }
      })
      await Promise.all(promises)

      // Call Supabase Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

      const response = await fetch(
        `${supabaseUrl}/functions/v1/push-course-to-github`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ files: fileEntries, folderName, title, subtitle, type }),
        }
      )

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Upload failed')
      }

      const result = await response.json()
      toast.success(t('admin.githubToast'), { duration: 6000 })
      setUploading(false)
      return result.url
    } catch (err) {
      toast.error(err.message)
      setUploading(false)
      return null
    }
  }

  // Expose processZip via ref-like callback
  if (onSuccess) {
    onSuccess.__processZip = processZip
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-brand-orange bg-brand-cream-light'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-brand-border hover:border-brand-orange/50 hover:bg-brand-light'
        }`}
      >
        {file ? (
          <>
            <FileArchive size={28} className="text-green-600" />
            <p className="text-sm font-medium text-green-700">{file.name}</p>
            <p className="text-xs text-brand-muted">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <Upload size={28} className="text-brand-muted" />
            <p className="text-sm text-brand-muted text-center">{t('admin.uploadZip')}</p>
            <p className="text-xs text-brand-muted">{t('admin.uploadZipHint')}</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploading && (
        <p className="text-xs text-brand-muted text-center animate-pulse">{t('admin.uploadingZip')}</p>
      )}
    </div>
  )
}
