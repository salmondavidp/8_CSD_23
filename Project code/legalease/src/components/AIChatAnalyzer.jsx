import React, { useState, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import '../style/chatUI.css';

const ChatUI = () => {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    const savedActiveChatId = localStorage.getItem('activeChatId');
    return savedActiveChatId ? JSON.parse(savedActiveChatId) : null;
  });
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
  }, [chats, activeChatId]);

  const fetchAIResponse = async (userInput) => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key.');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are a professional Indian lawyer providing legal advice and assistance.' },
            { role: 'user', content: userInput }
          ]
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return 'There was an error processing your request. Please try again.';
    }
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { id: Date.now(), text: input, sender: 'user' };
    let chatIdToUpdate = activeChatId;

    if (activeChatId !== null) {
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, newMessage] };
        }
        return chat;
      }));
    } else {
      const newChat = {
        id: Date.now(),
        title: `Chat ${chats.length + 1}`,
        messages: [newMessage]
      };
      setChats(prevChats => [...prevChats, newChat]);
      setActiveChatId(newChat.id);
      chatIdToUpdate = newChat.id;
    }

    setInput('');

    const aiResponseText = await fetchAIResponse(input);
    const aiResponse = { id: Date.now(), text: aiResponseText, sender: 'ai' };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatIdToUpdate) {
        return { ...chat, messages: [...chat.messages, aiResponse] };
      }
      return chat;
    }));
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chats.length + 1}`,
      messages: []
    };

    setChats(prevChats => [...prevChats, newChat]);
    setActiveChatId(newChat.id);

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === newChat.id) {
        return {
          ...chat,
          messages: [{
            id: Date.now(),
            text: "Welcome! How can I assist you with your legal questions today?  Remember, I'm an AI and cannot provide actual legal advice.  My responses are for informational purposes only.",
            sender: 'ai'
          }]
        };
      }
      return chat;
    }));
  };

  const activeChat = chats.find(chat => chat.id === activeChatId);

  return (
    <div className="chat-container">
      <aside className="chat-sidebar">
        <h2>Chat History</h2>
        <div className="api-key-input">
          <input
            type="password"
            placeholder="Enter OpenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <div className="model-select">
          <label htmlFor="model">Choose Model:</label>
          <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>New Chat</button>
        <div className="history-list">
          {chats.map((chat) => (
            <div key={chat.id} className="history-item" onClick={() => selectChat(chat.id)}>
              {chat.title}
              <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-messages">
          {activeChat ? (
            activeChat.messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))
          ) : (
            <p>Welcome! How can I assist you with your legal questions today?<br/>Remember, I'm an AI and cannot provide actual legal advice.  My responses are for informational purposes only..</p>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>
            <Send size={20} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default ChatUI;