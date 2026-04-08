import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.css';

// Inline markdown renderer — no external deps, handles Claude's common output patterns
function renderInline(text: string, key: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return (
    <React.Fragment key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </React.Fragment>
  );
}

function MarkdownContent({ children, className }: { children: string; className?: string }) {
  const nodes = useMemo(() => {
    const blocks: React.ReactNode[] = [];
    const segments = children.split(/(```[\w]*\n[\s\S]*?```)/g);

    segments.forEach((seg, si) => {
      if (seg.startsWith('```')) {
        const code = seg.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        blocks.push(<pre key={`pre-${si}`} className={styles.codeBlock}><code>{code}</code></pre>);
        return;
      }

      const lines = seg.split('\n');
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        const hm = line.match(/^(#{1,3})\s+(.+)/);
        if (hm) {
          const Tag = `h${hm[1].length}` as 'h1' | 'h2' | 'h3';
          blocks.push(<Tag key={`h-${si}-${i}`}>{renderInline(hm[2], `hi-${si}-${i}`)}</Tag>);
          i++; continue;
        }
        if (/^[-*]\s+/.test(line)) {
          const items: React.ReactNode[] = [];
          while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
            items.push(<li key={i}>{renderInline(lines[i].replace(/^[-*]\s+/, ''), `li-${si}-${i}`)}</li>);
            i++;
          }
          blocks.push(<ul key={`ul-${si}-${i}`}>{items}</ul>);
          continue;
        }
        if (/^\d+\.\s+/.test(line)) {
          const items: React.ReactNode[] = [];
          while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
            items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\.\s+/, ''), `oli-${si}-${i}`)}</li>);
            i++;
          }
          blocks.push(<ol key={`ol-${si}-${i}`}>{items}</ol>);
          continue;
        }
        if (line.trim()) {
          const paraLines: string[] = [];
          while (i < lines.length && lines[i].trim() && !/^#{1,3}\s/.test(lines[i]) && !/^[-*\d]/.test(lines[i])) {
            paraLines.push(lines[i]);
            i++;
          }
          blocks.push(
            <p key={`p-${si}-${i}`}>
              {paraLines.flatMap((l, li) =>
                li < paraLines.length - 1
                  ? [renderInline(l, `pl-${si}-${li}`), <br key={`br-${li}`} />]
                  : [renderInline(l, `pl-${si}-${li}`)]
              )}
            </p>
          );
        } else {
          i++;
        }
      }
    });
    return blocks;
  }, [children]);

  return <div className={className}>{nodes}</div>;
}

const WIDGET_API = 'https://chat.devdocify.com/api/widget-chat';
const REQUEST_TIMEOUT_MS = 45000;
const REQUEST_TIMEOUT_MESSAGE = 'The AI request timed out. Please try again.';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...next, assistantMsg]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      ctrl.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(WIDGET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch (err) {
      const message =
        (err as Error).name === 'AbortError' && didTimeout
          ? REQUEST_TIMEOUT_MESSAGE
          : 'Sorry, something went wrong. Please try again.';
      if ((err as Error).name !== 'AbortError' || didTimeout) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: message,
          };
          return updated;
        });
      } else {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      window.clearTimeout(timeoutId);
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, messages, streaming]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setStreaming(false);
  }, []);

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z"
                fill="currentColor"
              />
            </svg>
            <p>Ask me anything about DevDocify</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
          >
            {msg.role === 'user' ? (
              msg.content
            ) : msg.content ? (
              <MarkdownContent className={styles.markdown}>{msg.content}</MarkdownContent>
            ) : (
              streaming && i === messages.length - 1 ? (
                <span className={styles.cursor} aria-label="Thinking" />
              ) : null
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question…"
          rows={1}
          disabled={streaming}
          aria-label="Message input"
        />
        {streaming ? (
          <button
            className={`${styles.sendBtn} ${styles.stopBtn}`}
            onClick={stop}
            type="button"
            aria-label="Stop"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
          </button>
        ) : (
          <button
            className={styles.sendBtn}
            onClick={send}
            disabled={!input.trim()}
            type="button"
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {messages.length > 0 && !streaming && (
        <button className={styles.resetBtn} onClick={reset} type="button">
          New conversation
        </button>
      )}
    </div>
  );
}

interface AiPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiPanel({ isOpen, onClose }: AiPanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label="AI assistant"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="currentColor" />
            </svg>
            Ask AI
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close AI assistant"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ChatWidget />
      </div>
    </>
  );
}

export function AiPanelButton() {
  return (
    <button
      className={styles.triggerBtn}
      onClick={() => window.dispatchEvent(new CustomEvent('open-ai-panel'))}
      aria-label="Open AI assistant"
      type="button"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="currentColor" />
      </svg>
      Ask AI
    </button>
  );
}
