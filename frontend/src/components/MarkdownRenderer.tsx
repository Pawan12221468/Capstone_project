import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Lightbulb, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Enhanced Inline Markdown Parser
 */
function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-300">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-indigo-500/15 text-indigo-300 text-[0.85em] px-1.5 py-0.5 rounded-md font-mono border border-indigo-500/20">$1</code>');
}

const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 rounded-2xl overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl">
      <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          <span className="ml-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            {lang || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-indigo-400 transition-all"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto font-mono text-[0.85rem] leading-relaxed text-indigo-100/90 selection:bg-indigo-500/30">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="space-y-3 my-5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const key = `block-${idx}`;
    const trimmed = line.trim();

    // ── Code Blocks ──
    if (trimmed.startsWith('```')) {
      if (!inCode) {
        flushList(`list-before-${idx}`);
        inCode = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
      } else {
        blocks.push(<CodeBlock key={`code-${idx}`} code={codeLines.join('\n')} lang={codeLang} />);
        inCode = false;
        codeLines = [];
        codeLang = '';
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }

    // ── Horizontal Rules / Underlines ──
    if (/^[=-]{3,}$/.test(trimmed)) {
        flushList(`list-hr-${idx}`);
        blocks.push(<hr key={key} className="my-8 border-white/5" />);
        return;
    }

    // ── Headings ──
    if (trimmed.startsWith('# ')) {
      flushList(`list-h1-${idx}`);
      blocks.push(
        <h1 key={key} className="text-2xl md:text-3xl font-extrabold text-white mt-10 mb-6 tracking-tight">
          {trimmed.slice(2)}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`list-h2-${idx}`);
      blocks.push(
        <h2 key={key} className="text-xl md:text-2xl font-bold text-white mt-8 mb-4 tracking-tight border-l-4 border-indigo-500 pl-4">
          {trimmed.slice(3)}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList(`list-h3-${idx}`);
      blocks.push(
        <h3 key={key} className="text-lg font-bold text-indigo-300 mt-6 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
      return;
    }

    // ── Bullet Lists ──
    if (/^[-*•]\s/.test(trimmed)) {
      const itemContent = trimmed.replace(/^[-*•]\s/, '');
      listItems.push(
        <li key={key} className="flex items-start gap-3 text-slate-300 text-[0.95rem]">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-[0.6em] shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span dangerouslySetInnerHTML={{ __html: applyInline(itemContent) }} />
        </li>
      );
      return;
    }

    // ── Numbered Lists (1. Content) ──
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      flushList(`list-num-${idx}`);
      blocks.push(
        <div key={key} className="flex items-start gap-4 text-[0.95rem] text-slate-300 my-4 group">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-[0.75rem] font-bold border border-indigo-500/20 shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            {numMatch[1]}
          </span>
          <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: applyInline(numMatch[2]) }} />
        </div>
      );
      return;
    }

    // ── Special Callouts / Exercises ──
    if (/^(Try this:|Think about it:|✏️|🤔|Exercise:|Challenge:|Key Concepts:)/i.test(trimmed)) {
      flushList(`list-callout-${idx}`);
      blocks.push(
        <div key={key} className="mt-8 mb-6 relative overflow-hidden bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent border border-indigo-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lightbulb className="w-12 h-12 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 text-[0.7rem] font-black uppercase tracking-[0.2em]">Callout</span>
          </div>
          <p className="text-white font-bold text-lg mb-2" dangerouslySetInnerHTML={{ __html: applyInline(trimmed) }} />
        </div>
      );
      return;
    }

    // ── Key: Value lines (Special Case for the user's React example) ──
    const keyValueMatch = trimmed.match(/^([^:]+):\s+(.+)$/);
    if (keyValueMatch && !trimmed.startsWith('http') && trimmed.length < 500 && !trimmed.includes('#')) {
        flushList(`list-kv-${idx}`);
        blocks.push(
            <div key={key} className="my-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-colors">
                <span className="font-bold text-indigo-400 block mb-1 text-sm uppercase tracking-wider">{keyValueMatch[1]}</span>
                <span className="text-slate-300 text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: applyInline(keyValueMatch[2]) }} />
            </div>
        );
        return;
    }

    // ── Plain Paragraphs ──
    if (trimmed === '') {
      flushList(`empty-${idx}`);
      blocks.push(<div key={key} className="h-4" />);
      return;
    }

    flushList(`list-p-${idx}`);
    blocks.push(
      <p key={key} className="text-[0.95rem] leading-relaxed text-slate-300 mb-4 font-normal" dangerouslySetInnerHTML={{ __html: applyInline(line) }} />
    );
  });

  flushList('final');

  return (
    <div className={`markdown-body selection:bg-indigo-500/30 ${className}`}>
      {blocks}
    </div>
  );
};

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

export default MarkdownRenderer;
