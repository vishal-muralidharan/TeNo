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
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {copied ? <Check size={16} /> : currentToken ? <Copy size={16} /> : <Share2 size={16} />}
      {copied ? 'Copied!' : currentToken ? 'Copy Invite Link' : 'Generate Invite'}
    </button>
  );
}
