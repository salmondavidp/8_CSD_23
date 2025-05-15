import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DocDraft from './Frontend/Docdraft';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/docdraft" element={<DocDraft />} />
      </Routes>
    </Router>
  );
}

root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

reportWebVitals();
