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

  // ── UploadBox ────────────────────────────────────────────────────────────
  const UploadBox = ({ label, hint, icon, upload, inputRef, onChange }: UploadBoxProps) => {
    const isDone = upload.state === 'done'
    const isError = upload.state === 'error'
    const isUploading = upload.state === 'uploading'

    return (
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${isDone ? 'rgba(34,197,94,0.5)' : isError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 16, padding: '18px',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          background: isDone ? 'rgba(34,197,94,0.04)' : isError ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        {/* Upload area hover shimmer */}
        <style>{`
          .upload-box:hover { border-color: rgba(249,115,22,0.35) !important; background: rgba(249,115,22,0.03) !important; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes uploadPop {
            0% { transform: scale(0.8); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          .upload-pop { animation: uploadPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>

        {upload.preview ? (
          <>
            <div style={{
              width: 60, height: 60, borderRadius: 10, overflow: 'hidden',
              flexShrink: 0, position: 'relative',
            }}>
              <img src={upload.preview} alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {isUploading && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 3px', color: '#fff' }}>{label}</p>
              <p style={{ fontSize: 12, margin: 0, color: isUploading ? 'rgba(255,255,255,0.4)' : isDone ? '#4ade80' : '#f87171' }}>
                {isUploading ? 'Uploading…' : isDone ? '✓ Uploaded successfully' : '✗ Upload failed'}
              </p>
            </div>
            {isDone && (
              <div className="upload-pop" style={{
                width: 28, height: 28, borderRadius: '50%', background: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>✓</div>
            )}
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{icon}</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>{label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', margin: 0 }}>{hint}</p>
            </div>
            <div style={{
              marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'rgba(255,255,255,0.4)',
            }}>↑</div>
          </>
        )}

        <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={onChange}
          style={{ display: 'none' }} />
      </div>
    )
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, color: '#fff', fontSize: 14,
    fontFamily: 'Outfit, sans-serif',
  }

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.4)', marginBottom: 8,
    letterSpacing: '0.08em', textTransform: 'uppercase',
  }

  // Upload progress summary
  const uploadsDone = [idDoc, selfie, dashboard].filter(u => u.state === 'done').length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 18,
        }}>🪪</div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>ID & verification photos</h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Upload any govt. ID, a selfie, and your gig app dashboard screenshot
        </p>
      </div>

      {/* Upload progress bar */}
      {uploadsDone > 0 && (
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(uploadsDone / 3) * 100}%`,
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              borderRadius: 2, transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {uploadsDone}/3 uploaded
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: '#fca5a5', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Doc type */}
      <div style={{ marginBottom: 16 }}>
        <label style={lbl}>Document type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            { value: 'aadhaar', label: 'Aadhaar Card', emoji: '🪪' },
            { value: 'pan', label: 'PAN Card', emoji: '💳' },
            { value: 'driving_license', label: 'Driving License', emoji: '🪪' },
            { value: 'voter_id', label: 'Voter ID', emoji: '🗳️' },
          ].map(opt => (
            <button key={opt.value}
              type="button"
              onClick={() => setDocType(opt.value)}
              style={{
                padding: '11px 14px',
                background: docType === opt.value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${docType === opt.value ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 11, cursor: 'pointer', color: '#fff',
                fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s ease', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span>{opt.emoji}</span>
              <span style={{ color: docType === opt.value ? '#fb923c' : 'rgba(255,255,255,0.7)' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Doc number */}
      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>
          {docType === 'aadhaar' ? 'Aadhaar number (last 4 digits)' :
           docType === 'pan' ? 'PAN number' :
           docType === 'driving_license' ? 'DL number' :
           docType === 'voter_id' ? 'Voter ID number' :
           'Document number'}
        </label>
        <input
          style={inp}
          placeholder={
            docType === 'aadhaar' ? 'XXXX XXXX 1234' :
            docType === 'pan' ? 'ABCDE1234F' : 'Enter number'
          }
          value={docNumber}
          onChange={e => setDocNumber(e.target.value.toUpperCase())}
        />
      </div>

      {/* Upload boxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        <UploadBox
          label="Upload ID document"
          hint="Photo or PDF of your govt. ID · Max 10MB"
          icon="📄"
          upload={idDoc}
          inputRef={idRef}
          onChange={e => handleFileChange(e, setIdDoc, 'id_doc')}
        />
        <UploadBox
          label="Take a selfie"
          hint="Clear photo of your face · Natural light works best"
          icon="🤳"
          upload={selfie}
          inputRef={selfieRef}
          onChange={e => handleFileChange(e, setSelfie, 'selfie')}
        />
        <UploadBox
          label="Gig platform dashboard"
          hint="Screenshot showing your earnings & delivery count"
          icon="📊"
          upload={dashboard}
          inputRef={dashRef}
          onChange={e => handleFileChange(e, setDashboard, 'dashboard')}
        />
      </div>

      <button
        className="step-btn"
        onClick={handleSubmit} disabled={submitting}
        style={{
          width: '100%', padding: '15px',
          background: submitting ? 'rgba(249,115,22,0.35)' : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
          border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
          transition: 'all 0.25s ease',
        }}
      >
        {submitting ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  )
}