import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Document from './components/Document';
import AIChatAnalyzer from './components/AIChatAnalyzer';
import './App.css';

const App = () => {
  const [activePage, setActivePage] = useState('home');

  return (
    <div>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className="container">
        {activePage === 'home' && (
          <div>
            <h2>Welcome to LegalDoc AI Assistant</h2>
            <p>Simplify your legal documentation process with AI-powered tools designed for individuals and small businesses in India.</p>
          </div>
        )}
        {activePage === 'create' && <Document />}
        {activePage === 'analyze' && <AIChatAnalyzer />}
      </div>
    </div>
  );
};

export default App;
