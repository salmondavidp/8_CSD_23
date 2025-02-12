import React from 'react';
import '../style/navbar.css';

const Navbar = ({ activePage, setActivePage }) => {
  return (
    <nav className="sidebar">
      <h1 className="sidebar-title">Legalease</h1>
      <div className="sidebar-buttons">
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => setActivePage('home')}
        >
          Home
        </button>
        <button
          className={activePage === 'create' ? 'active' : ''}
          onClick={() => setActivePage('create')}
        >
          Create Document
        </button>
        <button
          className={activePage === 'analyze' ? 'active' : ''}
          onClick={() => setActivePage('analyze')}
        >
          Analyze Document
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
