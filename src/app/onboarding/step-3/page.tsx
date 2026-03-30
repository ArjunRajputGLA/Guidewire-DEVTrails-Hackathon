// app/onboarding/step-3/page.tsx
'use client'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface FileUpload {
  file: File | null
  url: string
  state: UploadState
  preview: string
}

const emptyUpload = (): FileUpload => ({ file: null, url: '', state: 'idle', preview: '' })

// ── Fix 1: useRef<HTMLInputElement>(null) → useRef<HTMLInputElement | null>(null)
// ── Fix 2: UploadBox inputRef type updated to match
interface UploadBoxProps {
  label: string
  hint: string
  icon: string
  upload: FileUpload
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Step3() {
  const router = useRouter()
  const [docType, setDocType]     = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [idDoc, setIdDoc]         = useState<FileUpload>(emptyUpload())
  const [selfie, setSelfie]       = useState<FileUpload>(emptyUpload())
  const [dashboard, setDashboard] = useState<FileUpload>(emptyUpload())
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fix: type is RefObject<HTMLInputElement | null>
  const idRef:      React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const selfieRef:  React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const dashRef:    React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)

  const uploadFile = async (
    file: File,
    path: string,
    setter: React.Dispatch<React.SetStateAction<FileUpload>>
  ): Promise<string> => {
    setter(p => ({ ...p, state: 'uploading' }))
    const { data: { user } } = await supabase.auth.getUser()

    const ext = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${user!.id}/${path}_${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('worker-documents')
      .upload(filePath, file)

    if (uploadError) {
      setter(p => ({ ...p, state: 'error' }))
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('worker-documents')
      .getPublicUrl(filePath)

    setter(p => ({ ...p, url: publicUrl, state: 'done' }))
    return publicUrl
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileUpload>>,
    path: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('File size must be under 10MB'); return }

    const preview = URL.createObjectURL(file)
    setter({ file, url: '', state: 'idle', preview })
    uploadFile(file, path, setter).catch(err => setError((err as Error).message))
  }

  const handleSubmit = async () => {
    setError('')
    if (!docType)               { setError('Please select a document type'); return }
    if (!docNumber)             { setError('Please enter your document number'); return }
    if (idDoc.state !== 'done') { setError('Please upload your ID document'); return }
    if (selfie.state !== 'done'){ setError('Please upload a selfie photo'); return }
    if (dashboard.state !== 'done') { setError('Please upload your gig platform dashboard screenshot'); return }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: kycError } = await supabase.from('kyc_documents').insert({
      worker_id: user.id,
      doc_type: docType as 'aadhaar' | 'pan' | 'driving_license' | 'voter_id',
      doc_number: docNumber,
      doc_url: idDoc.url,
      selfie_url: selfie.url,
      platform_dashboard_url: dashboard.url,
    })

    if (kycError) { setError(kycError.message); setSubmitting(false); return }

    await supabase
      .from('worker_profiles')
      .update({ onboarding_step: 4 })
      .eq('id', user.id)

    router.push('/onboarding/step-4')
  }

  // ── UploadBox component ──────────────────────────────────────────────────
  const UploadBox = ({ label, hint, icon, upload, inputRef, onChange }: UploadBoxProps) => (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${
          upload.state === 'done'  ? '#22c55e' :
          upload.state === 'error' ? '#ef4444' :
          'rgba(255,255,255,0.15)'
        }`,
        borderRadius: 14,
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'center' as const,
        background: upload.preview ? 'transparent' : 'rgba(255,255,255,0.03)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        transition: 'border-color 0.2s',
      }}
    >
      {upload.preview ? (
        <div style={{ position: 'relative' as const }}>
          <img
            src={upload.preview}
            alt="preview"
            style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' as const }}
          />
          {upload.state === 'uploading' && (
            <div style={{
              position: 'absolute' as const, inset: 0,
              background: 'rgba(0,0,0,0.5)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14,
            }}>Uploading...</div>
          )}
          {upload.state === 'done' && (
            <div style={{
              position: 'absolute' as const, top: 6, right: 6,
              background: '#22c55e', borderRadius: '50%',
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>✓</div>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{hint}</div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 15,
    fontFamily: '"DM Sans", sans-serif', outline: 'none',
  }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        select option { background: #1a1a2e; }
        input:focus, select:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
        .btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(249,115,22,0.15)', marginBottom: 16, fontSize: 24,
        }}>🪪</div>
        <h2 style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: 24, margin: '0 0 8px',
        }}>ID & verification photos</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          Upload any govt. ID, a selfie, and your gig app dashboard screenshot
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: '#fca5a5', fontSize: 14,
        }}>{error}</div>
      )}

      {/* Doc type */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          Document type
        </label>
        <select style={inputStyle} value={docType} onChange={e => setDocType(e.target.value)}>
          <option value="">Select ID type</option>
          <option value="aadhaar">Aadhaar Card</option>
          <option value="pan">PAN Card</option>
          <option value="driving_license">Driving License</option>
          <option value="voter_id">Voter ID</option>
        </select>
      </div>

      {/* Doc number */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
          {docType === 'aadhaar'          ? 'Aadhaar number (last 4 digits only)' :
           docType === 'pan'              ? 'PAN number' :
           docType === 'driving_license'  ? 'DL number' :
           docType === 'voter_id'         ? 'Voter ID number' :
                                           'Document number'}
        </label>
        <input
          style={inputStyle}
          placeholder={
            docType === 'aadhaar' ? 'XXXX XXXX 1234' :
            docType === 'pan'     ? 'ABCDE1234F' :
                                    'Enter number'
          }
          value={docNumber}
          onChange={e => setDocNumber(e.target.value.toUpperCase())}
        />
      </div>

      {/* Upload boxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        <UploadBox
          label="Upload ID document"
          hint="Photo or PDF of your govt. ID • Max 10MB"
          icon="📄"
          upload={idDoc}
          inputRef={idRef}
          onChange={e => handleFileChange(e, setIdDoc, 'id_doc')}
        />
        <UploadBox
          label="Take a selfie"
          hint="Clear photo of your face • Natural light works best"
          icon="🤳"
          upload={selfie}
          inputRef={selfieRef}
          onChange={e => handleFileChange(e, setSelfie, 'selfie')}
        />
        <UploadBox
          label="Gig platform dashboard screenshot"
          hint="Screenshot showing your earnings & delivery count"
          icon="📊"
          upload={dashboard}
          inputRef={dashRef}
          onChange={e => handleFileChange(e, setDashboard, 'dashboard')}
        />
      </div>

      <button
        className="btn"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%', padding: '15px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: 'none', borderRadius: 12,
          color: '#fff', fontSize: 16, fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: '"DM Sans", sans-serif',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  )
}