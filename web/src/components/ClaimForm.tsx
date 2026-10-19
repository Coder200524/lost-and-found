'use client';

// Client Component for Claim Form (FST Unit 1: RSC vs Client Components 'use client')
import { useState } from 'react';
import { submitClaimAction } from '@/actions/claims';

interface ClaimFormProps {
  itemId: string;
  defaultName?: string;
  defaultEmail?: string;
}

export default function ClaimForm({ itemId, defaultName = '', defaultEmail = '' }: ClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await submitClaimAction(formData);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to submit verification claim');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
        <span className="font-bold">✓ Verification claim submitted!</span>
        <p className="mt-1 text-[11px] text-emerald-700">
          The finder and campus administrators have been notified. Check your Profile page for status updates.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input type="hidden" name="itemId" value={itemId} />

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200 font-semibold">
          {error}
        </div>
      )}

      <input
        type="text"
        name="claimantName"
        defaultValue={defaultName}
        placeholder="Your Full Name"
        required
        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
      />
      <input
        type="email"
        name="claimantEmail"
        defaultValue={defaultEmail}
        placeholder="Your College Email (e.g. name@djsce.edu)"
        required
        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
      />
      <textarea
        name="proofDetails"
        rows={2}
        placeholder="Proof of ownership (e.g. serial number, distinctive marks, lock screen, roll number)..."
        required
        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#e8848f] hover:bg-[#d86f7b] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
      >
        {loading ? 'Submitting Claim...' : 'Submit Verification Claim'}
      </button>
    </form>
  );
}
