'use client';

import React, { useState } from 'react';

interface DigestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formattedText: string;
}

export const DigestPreviewModal: React.FC<DigestPreviewModalProps> = ({
  isOpen,
  onClose,
  formattedText,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Daily Briefing Digest</h2>
            <p className="text-xs text-muted-foreground">Plain-Text Notification Briefing</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            ✕
          </button>
        </div>

        {/* Text Container */}
        <div className="mt-4">
          <div className="rounded-md border border-input bg-muted/40 p-3.5 font-mono text-xs leading-relaxed text-foreground overflow-x-auto whitespace-pre-wrap">
            {formattedText}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">8:00 AM UTC Daily Alert</span>
          <button
            onClick={handleCopy}
            className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:opacity-90 transition"
          >
            {copied ? '✓ Copied' : 'Copy Text'}
          </button>
        </div>
      </div>
    </div>
  );
};
