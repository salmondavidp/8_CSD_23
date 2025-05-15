import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUpload, FiFile, FiTrash2, FiPlus } from 'react-icons/fi';
import { BsStopFill } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import './App.css';
import { useNavigate } from 'react-router-dom';
// Default system message for legal assistant
const SYSTEM_MESSAGE = {
  role: 'system',
  content: 'You are a knowledgeable legal AI assistant. Provide accurate, concise legal information.,' +
           'When unsure, recommend consulting an attorney. Always cite relevant laws when possible.'
};

const App = () => {
  // State management
  const navigate = useNavigate();
  const goToDocDraft = () => {
    navigate('/docdraft');
  };
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentContext, setDocumentContext] = useState([]);
  const [isProcessingDocs, setIsProcessingDocs] = useState(false);
  const messagesEndRef = useRef(null);
  
  

  // Initialize with sample conversation
  useEffect(() => {
    const savedConversations = JSON.parse(localStorage.getItem('legalAssistantConversations')) || [];
    
    if (savedConversations.length > 0) {
      setConversations(savedConversations);
      setActiveConversation(savedConversations[0].id);
      loadConversation(savedConversations[0].id);
    } else {
      const initialConvo = {
        id: generateId(),
        title: 'New Legal Consultation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setConversations([initialConvo]);
      setActiveConversation(initialConvo.id);
      setMessages([{
        id: 'system-msg',
        content: SYSTEM_MESSAGE.content,
        role: 'system',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('legalAssistantConversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  // Load conversation from backend
  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/conversation/${conversationId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setDocumentContext(data.documentContext || []);
      } else {
        // Initialize new conversation
        setMessages([{
          id: 'system-msg',
          content: SYSTEM_MESSAGE.content,
          role: 'system',
          timestamp: new Date().toISOString()
        }]);
        setDocumentContext([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsProcessingDocs(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:'}/api/process-documents`, 
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process documents');
      }

      const processedDocs = await response.json();
      
      setDocuments(prev => [...prev, ...processedDocs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        content: doc.content,
        summary: doc.summary
      }))]);

      // Add document context to AI knowledge
      const newContext = processedDocs.map(doc => ({
        id: doc.id,
        name: doc.name,
        content: doc.content
      }));
      setDocumentContext(prev => [...prev, ...newContext]);

      // Notify user with initial summary
      const summaryMessage = {
        id: `doc-${Date.now()}`,
        content: `I've processed ${files.length} document(s). Here are the summaries:\n\n${
          processedDocs.map(doc => `**${doc.name}**: ${doc.summary}`).join('\n\n')
        }`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, summaryMessage]);

      // Update conversation in backend
      await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:'}/api/chat`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId: activeConversation,
            messages: [...messages, summaryMessage],
            documentContext: newContext
          })
        }
      );

    } catch (error) {
      setMessages(prev => [...prev, {
        id: `doc-error-${Date.now()}`,
        content: `Error processing documents: ${error.message}`,
        role: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsProcessingDocs(false);
      e.target.value = '';
    }
  };

  // Start new conversation
  const startNewConversation = () => {
    const newConvo = {
      id: generateId(),
      title: 'New Legal Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConvo, ...prev]);
    setActiveConversation(newConvo.id);
    setMessages([{
      id: 'system-msg',
      content: SYSTEM_MESSAGE.content,
      role: 'system',
      timestamp: new Date().toISOString()
    }]);
    setDocumentContext([]);
    setDocuments([]);
  };

  // Send message to AI
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isProcessingDocs) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:'}/api/chat`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId: activeConversation,
            model: 'gpt-4',
            messages: [
              ...messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
                content: m.content
              })),
              { role: 'user', content: input }
            ],
            documentContext
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const assistantMessage = await response.json();
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation title if it's the first user message
      if (messages.filter(m => m.role === 'user').length === 1) {
        const newTitle = input.length > 30 ? `${input.substring(0, 30)}...` : input;
        setConversations(prev => prev.map(c => 
          c.id === activeConversation ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
        ));
      } else {
        setConversations(prev => prev.map(c => 
          c.id === activeConversation ? { ...c, updatedAt: new Date().toISOString() } : c
        ));
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        content: `Error: ${error.message}`,
        role: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete conversation
  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      startNewConversation();
    }
  };

  // Markdown components for better formatting
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          language={match[1]}
          children={String(children).replace(/\n$/, '')}
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    a({ node, ...props }) {
      return <a {...props} target="_blank" rel="noopener noreferrer" />;
    },
    table({ node, ...props }) {
      return <div className="table-container"><table {...props} /></div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat-btn"onClick={goToDocDraft}>Document Draft</button>
        <button className="new-chat-btn" onClick={startNewConversation}>
          <FiPlus /> New Chat
        </button>
        
         
    
        <div className="conversation-list">
          {conversations.map(convo => (
            <div 
              key={convo.id} 
              className={`conversation-item ${activeConversation === convo.id ? 'active' : ''}`}
              onClick={() => {
                setActiveConversation(convo.id);
                loadConversation(convo.id);
              }}
            >
              <div className="conversation-title">{convo.title}</div>
              <div className="conversation-meta">
                {new Date(convo.updatedAt).toLocaleDateString()}
              </div>
              <button 
                className="delete-conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(convo.id);
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
        
        <div className="document-manager">
          <h3>Legal Documents</h3>
          <div className="document-list">
            {documents.map(doc => (
              <div key={doc.id} className="document-item">
                <FiFile />
                <span>{doc.name}</span>
                <span className="doc-summary" title={doc.summary}>
                  {doc.summary.substring(0, 50)}{doc.summary.length > 50 ? '...' : ''}
                </span>
              </div>
            ))}
          </div>
          <label className="upload-btn">
            <FiUpload /> Upload Documents
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              disabled={isProcessingDocs}
            />
            {isProcessingDocs && <span className="processing-indicator">Processing...</span>}
          </label>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-content">
        {messages.length <= 1 ? (
          <div className="empty-state">
            <h2>AI Powered Legal Document Aissitant</h2>
            <p>Upload legal documents or ask questions about contracts, laws, or case analysis.</p>
            <div className="suggestions">
              <button onClick={() => setInput("Review this contract and highlight any problematic clauses")}>
                Contract Review
              </button>
              <button onClick={() => setInput("Explain the key points of this legal document")}>
                Document Summary
              </button>
              <button onClick={() => setInput("What are the legal requirements for forming a valid contract?")}>
                Legal Question
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.role === 'system' ? (
                    <div className="system-message">
                      <strong>System:</strong> {message.content}
                    </div>
                  ) : (
                    <ReactMarkdown components={components}>
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {(isLoading || isProcessingDocs) && (
              <div className="message assistant">
                <div className="typing-indicator">
                  <span>{isProcessingDocs ? 'Processing documents' : 'Analyzing legal question'}</span>
                  <div className="dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          {documents.length > 0 && (
            <div className="document-preview">
              {documents.map(doc => (
                <div key={doc.id} className="doc-tag">
                  {doc.name}
                </div>
              ))}
            </div>
          )}
          <div className="input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a legal question or upload documents..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || isProcessingDocs}
            />
            <button 
              className="send-btn" 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim() || isProcessingDocs}
            >
              {isLoading ? <BsStopFill /> : <FiSend />}
            </button>
          </div>
          <div className="disclaimer">
            Note: This AI provides general legal information, not professional legal advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;