import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Message, Document } from '../types/api';
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  MoreVertical, 
  Download,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Types are now imported from '../types/api'

const ChatPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSession = useCallback(async () => {
    try {
      setIsInitializing(true);
      if (!user || !sessionId) return;

      // Load chat session and messages
      const sessionData = await apiService.getChatSession(sessionId, user.id);
      setDocument(sessionData.document as Document);
      
      const sessionMessages = await apiService.getMessages(sessionId, user.id);
      // Ensure messages is an array and filter out any invalid messages
      const validMessages = Array.isArray(sessionMessages.messages) 
        ? sessionMessages.messages.filter(msg => msg && msg.role && msg.content)
        : [];
      
      // If no messages exist, add a welcome message
      if (validMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome-1',
          content: 'Hello! I can help you analyze this document. What would you like to know?',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(validMessages);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      // Fallback to mock data if API fails
      const mockDocument: Document = {
        id: '1',
        title: 'Research Paper - AI in Healthcare',
        filename: 'ai-healthcare-research.pdf',
        originalName: 'ai-healthcare-research.pdf',
        filePath: '/uploads/ai-healthcare-research.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'completed',
        extractedText: 'Sample extracted text from the document...',
        summary: 'This document discusses AI applications in healthcare...',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'unknown'
      };
      setDocument(mockDocument);

      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hello! I can help you analyze this document. What would you like to know?',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        }
      ];
      setMessages(mockMessages);
    } finally {
      setIsInitializing(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadChatSession();
    }
  }, [sessionId, loadChatSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to API
      console.log('Sending message to API:', { sessionId, currentMessage, userId: user.id });
      const response = await apiService.sendMessage(sessionId, currentMessage, user.id);
      console.log('API response:', response);
      
      // Add AI response to the chat
      if (response && response.assistantMessage) {
        setMessages(prev => [...prev, response.assistantMessage]);
      } else {
        console.error('Invalid API response structure:', response);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle specific error cases
      let errorMessage = 'I apologize, but I encountered an error while processing your question. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Document is still being processed')) {
          errorMessage = 'The document is still being processed. Please wait a moment and try again.';
        } else if (error.message.includes('Document processing failed')) {
          errorMessage = 'Document processing failed. Please try re-uploading the document.';
        } else if (error.message.includes('Document text extraction failed')) {
          errorMessage = 'Document text extraction failed. This may be due to an image-based PDF or encryption. Please try with a different document.';
        } else if (error.message.includes('Document content not available')) {
          errorMessage = 'Document content is not available. Please ensure the document was processed successfully.';
        } else if (error.message.includes('AI Q&A is not available')) {
          errorMessage = 'AI Q&A service is currently unavailable. Please check your API configuration.';
        }
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        confidence: 0.0
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Initializing Chat Session</h2>
          <p className="text-slate-400">Loading your document and preparing AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <div className="bg-[#0a0f1e] border-b border-white/5 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-white">{document?.title || 'Chat Session'}</h1>
              <p className="text-sm text-slate-500">{document?.filename}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Download className="w-4 h-4 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl h-[600px] flex flex-col shadow-xl">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {(messages || []).filter(message => message && message.role).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${ message.role === 'user' ? 'text-right' : 'text-left' }`}>
                        <div className={`inline-block p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'
                        }`}>
                          <MarkdownRenderer content={message.content} />

                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-xs font-medium mb-2 opacity-80">Sources:</p>
                              <div className="space-y-1">
                                {message.sources.map((source, index) => (
                                  <p key={index} className="text-xs italic opacity-70">"{source}"</p>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.confidence && (
                            <div className="mt-2 text-xs opacity-60">
                              Confidence: {Math.round(message.confidence * 100)}%
                            </div>
                          )}
                        </div>

                        <div className={`flex items-center space-x-2 mt-1.5 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-slate-600">{formatTimestamp(message.timestamp)}</span>
                          <button
                            onClick={() => copyMessage(message.content, message.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {copiedMessageId === message.id
                              ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                              : <Copy className="w-3 h-3 text-slate-600" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span className="text-slate-400 text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/5 p-4 bg-[#0f172a]">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the document..."
                  className="input-field resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
