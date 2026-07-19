'use client';

import React, { useState } from 'react';
import { ConnectAWSPayload } from '../lib/types';

interface ConnectAWSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (payload: ConnectAWSPayload) => Promise<void>;
}

export const ConnectAWSModal: React.FC<ConnectAWSModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [accountId, setAccountId] = useState('123456789012');
  const [roleArn, setRoleArn] = useState('arn:aws:iam::123456789012:role/PeekabooReadOnlyRole');
  const [externalId, setExternalId] = useState('ext-peekaboo-demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  if (!isOpen) return null;

  const trustPolicyJSON = JSON.stringify(
    {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: 'arn:aws:iam::445566778899:root' },
          Action: 'sts:AssumeRole',
          Condition: { StringEquals: { 'sts:ExternalId': externalId } },
        },
      ],
    },
    null,
    2
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConnect({ account_id: accountId, role_arn: roleArn, external_id: externalId });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(trustPolicyJSON);
    setCopiedPolicy(true);
    setTimeout(() => setCopiedPolicy(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground">Connect AWS Account</h2>
            <p className="text-xs text-muted-foreground">Read-Only IAM Role Access</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground">AWS Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              placeholder="e.g. 123456789012"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground">Read-Only IAM Role ARN</label>
            <input
              type="text"
              value={roleArn}
              onChange={(e) => setRoleArn(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              placeholder="arn:aws:iam::123456789012:role/PeekabooReadOnlyRole"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-foreground">AWS Trust Policy JSON</label>
              <button
                type="button"
                onClick={handleCopyPolicy}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                {copiedPolicy ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="mt-1 max-h-28 overflow-y-auto rounded-md border border-input bg-muted/50 p-2.5 text-[11px] font-mono text-muted-foreground">
              {trustPolicyJSON}
            </pre>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Connecting...' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
