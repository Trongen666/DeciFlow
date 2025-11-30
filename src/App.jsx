import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import CreateProduct from './pages/CreateProduct';
import Products from './pages/Products';
import 'bootstrap/dist/css/bootstrap.min.css';

// Simple Router for Demo (In real app use react-router-dom)
const Router = () => {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // client-side navigate helper for anchors / buttons
  const navigate = (to) => {
    if (to === path) return; // no-op
    window.history.pushState({}, '', to);
    setPath(to);
  };

  // Provide a tiny Link component that can be used across pages
  const Link = ({ to, children, className }) => (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );

  switch (path) {
    case '/':
      return <Home Link={Link} />;
    case '/dashboard':
      return <Dashboard Link={Link} />;
    case '/create':
      return <CreateProduct Link={Link} />;
    case '/products':
      return <Products Link={Link} />;
    // Add other routes here as you implement pages
    default:
      return <Home Link={Link} />;
  }
};

function App() {
  return (
    <Web3Provider>
      <div className="app-container bg-light min-vh-100">
        <nav className="navbar navbar-dark bg-dark mb-4">
          <div className="container">
            <span className="navbar-brand mb-0 h1">SupplyChain DApp</span>
            <div className="ms-auto d-none d-md-flex gap-3 align-items-center">
              <a className="text-white nav-link" href="/" onClick={(e) => {e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate'));}}>Home</a>
              <a className="text-white nav-link" href="/dashboard" onClick={(e) => {e.preventDefault(); window.history.pushState({}, '', '/dashboard'); window.dispatchEvent(new Event('popstate'));}}>Dashboard</a>
              <a className="text-white nav-link" href="/products" onClick={(e) => {e.preventDefault(); window.history.pushState({}, '', '/products'); window.dispatchEvent(new Event('popstate'));}}>Inventory</a>
            </div>
          </div>
        </nav>
        <Router />
      </div>
    </Web3Provider>
  );
}

export default App;