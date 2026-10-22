'use client';

// Client Component for Claim Form (FST Unit 1: RSC vs Client Components 'use client')
import { useState } from 'react';
import Link from 'next/link';
import { submitClaimAction } from '@/actions/claims';
import { CategoryLineIcon, LocationLineIcon, CalendarLineIcon, AlertLineIcon, LockLineIcon } from '@/components/LineIcons';

interface ClaimFormProps {
  itemId: string;
  itemTitle?: string;
  itemLocation?: string;
  itemCategory?: string;
  itemDate?: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultSapId?: string;
  defaultDepartment?: string;
}

const DEPARTMENTS = [
  'Information Technology',
  'Computer Engineering',
  'Computer Science & Engineering (Data Science)',
  'Artificial Intelligence & Machine Learning',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
];

const ACADEMIC_YEARS = [
  'First Year (FE)',
  'Second Year (SE)',
  'Third Year (TE)',
  'Final Year (BE)',
];

export default function ClaimForm({
  itemId,
  itemTitle,
  itemLocation,
  itemCategory,
  itemDate,
  defaultName = '',
  defaultEmail = '',
  defaultSapId = '',
  defaultDepartment = '',
}: ClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [rollNo, setRollNo] = useState('');
  const [sapId, setSapId] = useState(defaultSapId);
  const [department, setDepartment] = useState(defaultDepartment);
  const [academicYear, setAcademicYear] = useState('');
  const [proofDetails, setProofDetails] = useState('');

  // Real-time validation errors
  const [rollError, setRollError] = useState('');
  const [sapError, setSapError] = useState('');

  const handleRollChange = (val: string) => {
    const formatted = val.toUpperCase().trim();
    setRollNo(formatted);
    if (formatted && !/^[A-Za-z][0-9]{3}$/.test(formatted)) {
      setRollError('Roll number must be 1 letter followed by 3 digits (e.g. A123, B007).');
    } else {
      setRollError('');
    }
  };

  const handleSapChange = (val: string) => {
    // Only allow digits, max 12
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    setSapId(digitsOnly);
    if (digitsOnly && !/^6[0-9]{11}$/.test(digitsOnly)) {
      setSapError('SAP ID must be exactly 12 digits starting with 6 (e.g. 60004210045).');
    } else {
      setSapError('');
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    // Client-side regex checks
    if (!/^[A-Za-z][0-9]{3}$/.test(rollNo)) {
      setError('Please enter a valid Roll Number (e.g. A090, B007).');
      return;
    }

    if (!/^6[0-9]{10,11}$/.test(sapId)) {
      setError('SAP ID must be 11 or 12 numeric digits starting with 6 (e.g. 60017240146).');
      return;
    }

    const claimantEmail = (formData.get('claimantEmail') as string || '').trim().toLowerCase();
    if (!claimantEmail.endsWith('@svkmmumbai.onmicrosoft.com')) {
      setError('Compulsory SVKM Email Suffix required: email must end with @svkmmumbai.onmicrosoft.com');
      return;
    }

    if (!proofDetails.trim() || proofDetails.trim().length < 5) {
      setError('Please provide substantive proof of ownership.');
      return;
    }

    setLoading(true);
    formData.set('rollNo', rollNo);
    formData.set('sapId', sapId);
    formData.set('department', department);
    formData.set('academicYear', academicYear);
    formData.set('proofDetails', proofDetails.trim());

    const res = await submitClaimAction(formData);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to submit verification claim.');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div
        style={{
          padding: '18px',
          borderRadius: '14px',
          background: 'var(--mint)',
          border: '1.5px solid var(--mint-d)',
          color: 'var(--mint-d)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
          <span>✓</span> Verification Claim Submitted!
        </div>
        <p style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          Your claim is now in <strong>PENDING</strong> status. Our campus administrators and the finder have been alerted. You can track this claim and view status updates anytime on your profile.
        </p>
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/profile"
            style={{
              display: 'inline-block',
              padding: '7px 16px',
              borderRadius: '8px',
              background: 'var(--mint-d)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}
          >
            View My Claims
          </Link>
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            Safe Handover Protocol Active
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input type="hidden" name="itemId" value={itemId} />

      {/* Selected Item Basic Details Summary */}
      {itemTitle && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            fontSize: '0.82rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Claiming Item: {itemTitle}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-s)', flexWrap: 'wrap', alignItems: 'center' }}>
            {itemCategory && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CategoryLineIcon category={itemCategory} size={13} />
                <span>{itemCategory}</span>
              </span>
            )}
            {itemLocation && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <LocationLineIcon size={13} />
                <span>{itemLocation}</span>
              </span>
            )}
            {itemDate && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CalendarLineIcon size={13} />
                <span>{itemDate}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--rose)',
            border: '1px solid var(--rose-d)',
            color: 'var(--rose-d)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertLineIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Name and Email */}
      <div className="claim-field-grid">
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            Full Name <span style={{ color: 'var(--rose-d)' }}>*</span>
          </label>
          <input
            type="text"
            name="claimantName"
            defaultValue={defaultName}
            placeholder="e.g. Suruchi Makwana"
            required
            className="claim-input"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            College Email <span style={{ color: 'var(--rose-d)' }}>*</span>
          </label>
          <input
            type="email"
            name="claimantEmail"
            defaultValue={defaultEmail}
            placeholder="SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com"
            required
            className="claim-input"
          />
        </div>
      </div>

      {/* Roll Number & SAP ID */}
      <div className="claim-field-grid">
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            Roll Number <span style={{ color: 'var(--rose-d)' }}>*</span>
          </label>
          <input
            type="text"
            name="rollNo"
            value={rollNo}
            onChange={(e) => handleRollChange(e.target.value)}
            placeholder="e.g. A123, B007"
            maxLength={4}
            required
            className="claim-input"
            style={{
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              borderColor: rollError ? 'var(--rose-d)' : undefined,
            }}
          />
          {rollError ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--rose-d)', marginTop: '4px', display: 'block' }}>{rollError}</span>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-s)', marginTop: '4px', display: 'block' }}>1 letter + 3 digits (e.g. A123)</span>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            SVKM SAP ID <span style={{ color: 'var(--rose-d)' }}>*</span>
          </label>
          <input
            type="text"
            name="sapId"
            value={sapId}
            onChange={(e) => handleSapChange(e.target.value)}
            placeholder="e.g. 60004210045"
            maxLength={12}
            required
            className="claim-input"
            style={{
              fontFamily: 'monospace',
              borderColor: sapError ? 'var(--rose-d)' : undefined,
            }}
          />
          {sapError ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--rose-d)', marginTop: '4px', display: 'block' }}>{sapError}</span>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-s)', marginTop: '4px', display: 'block' }}>12 numeric digits starting with 6</span>
          )}
        </div>
      </div>

      {/* Department & Academic Year (Optional) */}
      <div className="claim-field-grid">
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            Department <span style={{ fontWeight: 400, color: 'var(--text-s)' }}>(Optional)</span>
          </label>
          <select
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="claim-input"
          >
            <option value="">Select Department...</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
            Academic Year <span style={{ fontWeight: 400, color: 'var(--text-s)' }}>(Optional)</span>
          </label>
          <select
            name="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="claim-input"
          >
            <option value="">Select Academic Year...</option>
            {ACADEMIC_YEARS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Proof of Ownership */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
          Proof of Ownership <span style={{ color: 'var(--rose-d)' }}>*</span>
        </label>
        <textarea
          name="proofDetails"
          value={proofDetails}
          onChange={(e) => setProofDetails(e.target.value)}
          rows={3}
          placeholder="Describe distinctive identifiers (e.g., sticker designs, engraving, serial number, lock screen wallpaper, specific contents, purchase invoice)..."
          required
          className="claim-textarea"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', fontSize: '0.72rem', color: 'var(--text-s)' }}>
          <LockLineIcon size={12} />
          <span>Proof details are kept strictly private to authorized campus reviewers.</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="claim-btn"
      >
        {loading ? 'Validating & Submitting...' : 'Confirm Ownership Claim'}
      </button>
    </form>
  );
}
