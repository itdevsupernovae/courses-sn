import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileArchive } from 'lucide-react'
import JSZip from 'jszip'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const map = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    webp: 'image/webp',
    xml: 'application/xml',
    txt: 'text/plain',
  }
  return map[ext] || 'application/octet-stream'
}

export default function ZipUploader({ folderName, onSuccess }) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
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

  async function processZip() {
    if (!file || !folderName) return null

    setUploading(true)
    setProgress({ done: 0, total: 0 })

    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      // Collect all file entries
      const entries = []
      zip.forEach((relativePath, entry) => {
        if (!entry.dir) entries.push({ relativePath, entry })
      })

      setProgress({ done: 0, total: entries.length })

      // Upload each file to Supabase Storage
      for (const { relativePath, entry } of entries) {
        const data = await entry.async('arraybuffer')
        const mimeType = getMimeType(relativePath)
        const storagePath = `${folderName}/${relativePath}`

        const { error } = await supabase.storage
          .from('courses')
          .upload(storagePath, data, {
            contentType: mimeType,
            upsert: true,
          })

        if (error) throw new Error(`Erreur upload ${relativePath}: ${error.message}`)
        setProgress(p => ({ ...p, done: p.done + 1 }))
      }

      // Get public URL of entry point
      const { data: urlData } = supabase.storage
        .from('courses')
        .getPublicUrl(`${folderName}/content/index.html`)

      setUploading(false)
      return urlData.publicUrl
    } catch (err) {
      toast.error(err.message)
      setUploading(false)
      return null
    }
  }

  // Expose processZip to parent
  if (onSuccess) {
    onSuccess.__processZip = processZip
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
          uploading
            ? 'border-brand-orange/40 bg-brand-cream-light cursor-wait'
            : dragging
            ? 'border-brand-orange bg-brand-cream-light cursor-copy'
            : file
            ? 'border-green-400 bg-green-50 cursor-pointer'
            : 'border-brand-border hover:border-brand-orange/50 hover:bg-brand-light cursor-pointer'
        }`}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-orange">
              {t('admin.uploadingZip')} {progress.done}/{progress.total}
            </p>
            {progress.total > 0 && (
              <div className="w-full max-w-xs bg-brand-border rounded-full h-1.5">
                <div
                  className="bg-brand-orange h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            )}
          </>
        ) : file ? (
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
    </div>
  )
}
