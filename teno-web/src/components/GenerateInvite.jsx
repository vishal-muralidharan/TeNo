import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Share2, Check, Copy } from 'lucide-react';

export default function GenerateInvite({ labelId, currentToken }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAndCopy = async () => {
    setIsGenerating(true);
    try {
      let tokenToCopy = currentToken;

      // Generate a new token if one doesn't exist
      if (!tokenToCopy) {
        tokenToCopy = crypto.randomUUID().split('-')[0]; // simple short id
        const labelRef = doc(db, 'shared_labels', labelId);
        await updateDoc(labelRef, {
          inviteToken: tokenToCopy
        });
      }

      const inviteLink = `${window.location.origin}/join/${tokenToCopy}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Failed to generate invite link');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateAndCopy}
      disabled={isGenerating}
      className="icon-btn"
      title={copied ? 'Copied!' : currentToken ? 'Copy Invite Link' : 'Generate Invite'}
    >
      {copied ? <Check size={14} /> : currentToken ? <Copy size={14} /> : <Share2 size={14} />}
    </button>
  );
}
