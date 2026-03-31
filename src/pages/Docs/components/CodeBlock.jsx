import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const CodeBlock = ({ code, language = 'json' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'relative',
      background: '#1e1e2e',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid var(--c-surface2)',
      marginTop: '16px',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#181825',
        borderBottom: '1px solid #313244',
        fontSize: '0.85rem',
        color: '#a6adc8',
        fontWeight: 600
      }}>
        <span>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a6adc8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#313244'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {copied ? <Check size={14} color="#a6e3a1" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: '16px',
        overflowX: 'auto',
        color: '#cdd6f4', // Catppuccin Text
        fontSize: '0.9rem',
        lineHeight: '1.5',
        fontFamily: '"Fira Code", "JetBrains Mono", monospace'
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
