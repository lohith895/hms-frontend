import React, { useState, useRef, useEffect } from 'react';
import { Card, Group, ActionIcon, Text, TextInput, ScrollArea, Badge, Tooltip } from '@mantine/core';
import { IconMessageChatbot, IconX, IconSend, IconCornerDownLeft, IconBrain, IconPill, IconStethoscope, IconMapPin, IconHelp } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AiAssistantWidget: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "### Hello! I am your Antigravity AI Assistant. 🤖\n\nI can help you navigate hospital services. Click one of the suggestions below or type a question!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, opened]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: messageText });
      
      // Add AI Response
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: res.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        sender: 'ai',
        text: "I am sorry, I experienced an error connecting to our system. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  const presetChips = [
    { label: 'Explain my medicines', query: 'Explain my medications', icon: IconPill, color: '#EC4899' },
    { label: 'Find a doctor', query: 'Find a doctor', icon: IconStethoscope, color: '#3B82F6' },
    { label: 'Where is Pharmacy?', query: 'Where is the pharmacy located?', icon: IconMapPin, color: '#10B981' },
    { label: 'Visiting hours', query: 'What are the visiting hours?', icon: IconHelp, color: '#F59E0B' },
  ];

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIcon
              size={56}
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                border: 'none',
                boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
                cursor: 'pointer',
              }}
              onClick={() => setOpened(true)}
            >
              <IconMessageChatbot size={28} color="white" />
            </ActionIcon>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '380px',
              height: '520px',
            }}
          >
            <Card
              radius="lg"
              p={0}
              style={{
                background: 'rgba(14, 22, 40, 0.95)',
                border: '1px solid #1C2B46',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1C2B46 0%, #0F172A 100%)',
                  borderBottom: '1px solid #1C2B46',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Group gap="sm">
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      padding: '8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBrain size={20} color="#6366F1" />
                  </div>
                  <div>
                    <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>
                      Antigravity AI Assistant
                    </Text>
                    <Group gap="xs" align="center" style={{ marginTop: '2px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                        }}
                      />
                      <Text size="xs" style={{ color: '#10B981', fontWeight: 600 }}>
                        Online
                      </Text>
                    </Group>
                  </div>
                </Group>

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setOpened(false)}
                  style={{ color: '#8BA3C7' }}
                >
                  <IconX size={18} />
                </ActionIcon>
              </div>

              {/* Chat Messages Area */}
              <ScrollArea style={{ flex: 1, padding: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {messages.map((m, idx) => {
                    const isUser = m.sender === 'user';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            background: isUser
                              ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                              : 'rgba(28, 43, 70, 0.6)',
                            border: isUser ? 'none' : '1px solid #1C2B46',
                            color: '#F0F6FF',
                            padding: '10px 14px',
                            borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            fontSize: '13px',
                            lineHeight: '1.4',
                            boxShadow: isUser ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none',
                          }}
                        >
                          {/* Markdown rendering fallback */}
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {m.text.split('\n').map((para, pIdx) => {
                              if (para.startsWith('### ')) {
                                return <Text key={pIdx} size="sm" style={{ fontWeight: 700, color: '#22D3EE', margin: '6px 0' }}>{para.replace('### ', '')}</Text>;
                              }
                              if (para.startsWith('- ') || para.startsWith('* ')) {
                                return <Text key={pIdx} size="xs" style={{ color: '#E2E8F0', paddingLeft: '10px' }}>{para}</Text>;
                              }
                              return <span key={pIdx}>{para}<br/></span>;
                            })}
                          </div>
                        </div>
                        <Text size="10px" style={{ color: '#4D6580', marginTop: '4px', padding: '0 4px' }}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {loading && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(28, 43, 70, 0.6)' }}>
                      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#8BA3C7', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#8BA3C7', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></span>
                      <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: '#8BA3C7', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></span>
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Suggestions Quick Chips */}
              <div style={{ padding: '8px 16px', borderTop: '1px solid #1C2B46' }}>
                <Group gap="xs" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                  {presetChips.map((chip, idx) => {
                    const ChipIcon = chip.icon;
                    return (
                      <Badge
                        key={idx}
                        variant="light"
                        color="indigo"
                        style={{
                          textTransform: 'none',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          height: 'auto',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          flexShrink: 0,
                        }}
                        onClick={() => handleSend(chip.query)}
                      >
                        <Group gap="4px" align="center">
                          <ChipIcon size={12} style={{ color: chip.color }} />
                          <Text size="11px" style={{ color: '#C8D9F5', fontWeight: 600 }}>{chip.label}</Text>
                        </Group>
                      </Badge>
                    );
                  })}
                </Group>
              </div>

              {/* Input Form */}
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #1C2B46',
                  background: '#0E1628',
                }}
              >
                <TextInput
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rightSection={
                    <ActionIcon
                      variant="filled"
                      color="blue"
                      onClick={() => handleSend(input)}
                      disabled={!input.trim()}
                      style={{
                        background: input.trim() ? '#2563EB' : '#1C2B46',
                        borderRadius: '6px',
                      }}
                    >
                      <IconSend size={14} />
                    </ActionIcon>
                  }
                  styles={{
                    input: {
                      backgroundColor: 'rgba(8, 13, 26, 0.8)',
                      borderColor: '#1C2B46',
                      color: '#F0F6FF',
                      borderRadius: '8px',
                      height: '40px',
                    },
                  }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default AiAssistantWidget;
