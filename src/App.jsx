import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

// Simple Router for Demo (In real app use react-router-dom)
const Router = () => {
  const path = window.location.pathname;

  switch (path) {
    case '/':
      return <Dashboard />;
    case '/dashboard':
      return <Dashboard />;
    // Add other routes here as you implement pages
    // case '/create': return <CreateProduct />;
    // case '/products': return <ProductList />;
    default:
      return <Dashboard />;
  }
};

function App() {
  return (
    <Web3Provider>
      <div className="app-container bg-light min-vh-100">
        <nav className="navbar navbar-dark bg-dark mb-4">
          <div className="container">
            <span className="navbar-brand mb-0 h1">SupplyChain DApp</span>
          </div>
        </nav>
        <Router />
      </div>
    </Web3Provider>
  );
}

export default App;