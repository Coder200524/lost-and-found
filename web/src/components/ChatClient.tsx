'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  senderName: string;
  senderRole?: string;
  text: string;
  createdAt: string;
  isMine: boolean;
}

interface Conversation {
  id: string;
  title: string;
  category: string;
  emoji: string;
  lastMessage: string;
  time: string;
  unread: number;
  matched: boolean;
  location: string;
}

export default function ChatClient() {
  const [conversations] = useState<Conversation[]>([
    {
      id: 'item-1',
      title: 'Navy Blue Dell Laptop Bag',
      category: 'Bags',
      emoji: '🎒',
      lastMessage: 'I have verified the Dell logo and laptop sleeve.',
      time: '12:40 PM',
      unread: 1,
      matched: true,
      location: '4th Floor IT Lab',
    },
    {
      id: 'item-2',
      title: 'Fastrack Silver Analog Watch',
      category: 'Accessories',
      emoji: '⌚',
      lastMessage: 'Is it kept at the Ground Floor Security?',
      time: 'Yesterday',
      unread: 0,
      matched: true,
      location: 'Central Library',
    },
    {
      id: 'item-3',
      title: 'Casio fx-991CW Calculator',
      category: 'Stationery',
      emoji: '✏️',
      lastMessage: 'Yes, it has a black sticker on the back.',
      time: 'Oct 18',
      unread: 0,
      matched: false,
      location: 'Room 602',
    },
  ]);

  const [activeConvo, setActiveConvo] = useState<Conversation>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderName: 'Finder (Rahul S.)',
      text: 'Hi! I found a Dell laptop bag in the 4th Floor IT Lab near Terminal 14.',
      createdAt: '12:30 PM',
      isMine: false,
    },
    {
      id: 'm2',
      senderName: 'You',
      text: 'Hello Rahul! Yes, I left my bag during the ADF lab practical.',
      createdAt: '12:35 PM',
      isMine: true,
    },
    {
      id: 'm3',
      senderName: 'Finder (Rahul S.)',
      text: 'Can you describe anything distinctive inside the front pocket so I know it is yours?',
      createdAt: '12:38 PM',
      isMine: false,
    },
  ]);

  const [inputText, setInputText] = useState('');

  const quickReplies = [
    'Can you share the serial number?',
    'Does it have any scratch or sticker?',
    'Where on campus can we meet for handover?',
    'I deposited it at the Ground Floor Security Desk.',
  ];

  function handleSend(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderName: 'You',
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate finder verification response after 1 second
    if (!textToSend?.includes('Security')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            senderName: 'Finder (Rahul S.)',
            text: 'That matches the item! Let us meet at the College Security Desk on the Ground Floor.',
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false,
          },
        ]);
      }, 1000);
    }
  }

  return (
    <div className="chat-layout">
      {/* CHAT SIDEBAR */}
      <aside className="chat-sidebar">
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
            In-App Verification Chat
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-s)', marginTop: '2px' }}>
            Private student-to-finder verification
          </p>
        </div>

        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <input
            type="text"
            placeholder="Search conversations..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              background: 'white',
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.map((c) => {
            const isActive = activeConvo.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConvo(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  background: isActive ? 'rgba(249,200,207,0.25)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {c.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-s)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px',
                    }}
                  >
                    {c.lastMessage}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-s)' }}>{c.time}</span>
                  {c.unread > 0 && (
                    <span
                      style={{
                        background: 'var(--rose-d)',
                        color: 'white',
                        borderRadius: '50px',
                        minWidth: '18px',
                        height: '18px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                      }}
                    >
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CHAT MAIN */}
      <main className="chat-main">
        {/* HEADER */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(255,252,253,0.92)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(249,200,207,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--lemon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
            }}
          >
            {activeConvo.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{activeConvo.title}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-s)', marginTop: '1px' }}>
              📍 Found at {activeConvo.location} &nbsp;•&nbsp; Anonymous Peer Handover
            </p>
          </div>
          <span
            style={{
              background: 'var(--mint)',
              color: 'var(--mint-d)',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            ✓ Matched
          </span>
          <Link
            href="/browse"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1.5px solid rgba(0,0,0,0.1)',
              background: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--text-s)',
            }}
          >
            Back to Browse
          </Link>
        </div>

        {/* MESSAGES STREAM */}
        <div className="messages">
          <div className="safety-msg">
            <div className="safety-bubble">
              🛡️ <strong>SVKM Campus Safety Reminder:</strong> Do not share personal phone numbers or passwords. Verify item details (serial number, scratches, contents) and arrange physical handover at the <strong>Ground Floor Security Desk</strong>.
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-s)', fontWeight: 600, margin: '8px 0' }}>
            Today
          </div>

          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.isMine ? 'mine' : ''}`}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: m.isMine ? 'var(--rose)' : 'var(--lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  marginTop: 'auto',
                }}
              >
                {m.isMine ? '👤' : '🎓'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: m.isMine ? 'flex-end' : 'flex-start' }}>
                <div className="msg-bubble">{m.text}</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-s)', padding: '0 4px' }}>
                  {m.createdAt}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK REPLIES */}
        <div
          style={{
            padding: '10px 24px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            flexShrink: 0,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              style={{
                padding: '7px 14px',
                borderRadius: '50px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                background: 'white',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                color: 'var(--text-s)',
                transition: 'all 0.18s',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '14px 20px',
            background: 'rgba(255,252,253,0.95)',
            borderTop: '1px solid rgba(249,200,207,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your verification message..."
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '24px',
              border: '1.5px solid rgba(0,0,0,0.08)',
              background: 'white',
              fontSize: '0.92rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.88rem', borderRadius: '50px' }}
          >
            Send 💬
          </button>
        </form>
      </main>
    </div>
  );
}
