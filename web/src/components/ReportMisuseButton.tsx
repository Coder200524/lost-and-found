'use client';

import { useState } from 'react';

interface ReportMisuseButtonProps {
  itemId: string;
}

export default function ReportMisuseButton({ itemId }: ReportMisuseButtonProps) {
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState('');

  async function handleReport() {
    if (reported) return;
    const confirmReport = window.confirm(
      'Are you sure you want to flag this item for administrative moderation? Fake claims or suspicious posts will be reviewed by campus security.'
    );
    if (!confirmReport) return;

    setReporting(true);
    setError('');

    try {
      const res = await fetch(`/api/items/${itemId}/report`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setReported(true);
      } else {
        setError(data.error || 'Failed to submit report.');
      }
    } catch {
      setError('Network error while reporting misuse.');
    } finally {
      setReporting(false);
    }
  }

  if (reported) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
        <span>⚠️</span>
        <span>Item reported for administrative review. Thank you for keeping SVKM safe.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleReport}
        disabled={reporting}
        className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-600 transition font-medium cursor-pointer"
        title="Report misuse or suspicious claim to campus security"
      >
        <span>🚩</span>
        <span>{reporting ? 'Reporting...' : 'Report Misuse / Fake Claim'}</span>
      </button>
      {error && <span className="text-[10px] text-rose-600 font-semibold">{error}</span>}
    </div>
  );
}
