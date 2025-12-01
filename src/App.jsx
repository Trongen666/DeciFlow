import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, getContractAddress, getContractABI } from "./utils/contractInfo";
import "bootstrap/dist/css/bootstrap.min.css";

// Import all pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Inventory from "./pages/Inventory";
import FinancialLedger from "./pages/FinancialLedger";
import Alerts from "./pages/Alerts"; // New Page

// Import all components
import ProductLifecycleTracker from "./components/ProductLifecycleTracker";
import Lifecycle from "./pages/Lifecycle";
import ProvenanceViewer from "./components/ProvenanceViewer";
import TransactionTracker from "./components/TransactionTracker";
import DeveloperConsole from "./components/DeveloperConsole";
import HealthCheckPanel from "./components/HealthCheckPanel";

const shortenAddress = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [role, setRole] = useState("Guest");
  const [currentPage, setCurrentPage] = useState("home");
  const [currentProductId, setCurrentProductId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        const web3Signer = web3Provider.getSigner();
        const address = await web3Signer.getAddress();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(address);

        // Load all contracts
        const supplyChain = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

        const alertAddr = getContractAddress("AlertSystem");
        const alertABI = getContractABI("AlertSystem");
        const alertSystem = alertAddr && alertABI ? new ethers.Contract(alertAddr, alertABI, web3Signer) : null;

        const finAddr = getContractAddress("FinancialTracking");
        const finABI = getContractABI("FinancialTracking");
        const financialTracking = finAddr && finABI ? new ethers.Contract(finAddr, finABI, web3Signer) : null;

        const invAddr = getContractAddress("InventoryManagement");
        const invABI = getContractABI("InventoryManagement");
        const inventoryManagement = invAddr && invABI ? new ethers.Contract(invAddr, invABI, web3Signer) : null;

        setContracts({
          supplyChain,
          alertSystem,
          financialTracking,
          inventoryManagement
        });

        // Get user role
        const userRole = await supplyChain.roles(address);
        if (userRole && userRole.length > 0) {
          setRole(userRole);
        } else {
          setRole("Unregistered");
        }
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Navigation helper
  const navigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page}`);
  };

  const Link = ({ to, children, className }) => (
    <a
      href={`/${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { id: "home", label: "🏠 Home", roles: ["all"] },
      { id: "dashboard", label: "📊 Dashboard", roles: ["Manufacturer", "Distributor", "Retailer"] },
    ];

    const roleSpecificItems = {
      Manufacturer: [
        { id: "create-product", label: "➕ Create Product", roles: ["Manufacturer"] },
        { id: "products", label: "📦 My Products", roles: ["Manufacturer"] },
        { id: "alerts", label: "🚨 Alerts", roles: ["Manufacturer"] },
      ],
      Distributor: [
        { id: "products", label: "📦 Products", roles: ["Distributor", "Retailer"] },
        { id: "inventory", label: "📊 Inventory", roles: ["Distributor", "Retailer"] },
        { id: "alerts", label: "🚨 Alerts", roles: ["Distributor"] },
      ],
      Retailer: [
        { id: "products", label: "📦 Products", roles: ["Distributor", "Retailer"] },
        { id: "inventory", label: "📊 Inventory", roles: ["Distributor", "Retailer"] },
      ],
      Customer: [
        { id: "products", label: "🔍 Track Products", roles: ["Customer"] },
      ]
    };

    const commonItems = [
      { id: "financial", label: "💰 Financial", roles: ["Manufacturer", "Distributor", "Retailer"] },
    ];

    const componentItems = [
      { id: "lifecycle", label: "🔄 Lifecycle Tracker", roles: ["all"] },
      { id: "provenance", label: "📜 Provenance", roles: ["all"] },
      { id: "transactions", label: "💳 Transactions", roles: ["all"] },
      { id: "health", label: "🏥 Health Check", roles: ["all"] },
      { id: "console", label: "🔧 Dev Console", roles: ["all"] },
    ];

    let items = [...baseItems];

    if (roleSpecificItems[role]) {
      items = [...items, ...roleSpecificItems[role]];
    }

    if (role !== "Customer" && role !== "Unregistered" && role !== "Guest") {
      items = [...items, ...commonItems];
    }

    items = [...items, ...componentItems];

    return items.filter(item =>
      item.roles.includes("all") ||
      item.roles.includes(role)
    );
  };

  // Render current page
  const renderPage = () => {
    const props = { Link, account, signer, provider, contracts, role, navigate };

    // Support dynamic product routes like '/product/123'
    if (currentPage && currentPage.startsWith('product/')) {
      const id = currentPage.split('/')[1];
      return <ProductDetail productId={id} Link={Link} />;
    }

    switch (currentPage) {
      case "home":
        return <Home {...props} />;
      case "dashboard":
        return <Dashboard {...props} />;
      case "create-product":
        return <CreateProduct {...props} />;
      case "products":
        return <Products {...props} />;
      case "product-detail":
        return <ProductDetail {...props} productId={currentProductId} />;
      case "inventory":
        return <Inventory {...props} />;
      case "financial":
        return <FinancialLedger {...props} />;
      case "alerts":
        return <Alerts {...props} />;
      case "lifecycle":
        return <Lifecycle {...props} />;
      case "provenance":
        return <ProvenanceViewer {...props} />;
      case "transactions":
        return <TransactionTracker {...props} />;
      case "health":
        return <HealthCheckPanel {...props} />;
      case "console":
        return <DeveloperConsole {...props} />;
      default:
        return <Home {...props} />;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1);
      if (path) setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {account && (
        <div
          className={`bg-dark text-white ${sidebarOpen ? "" : "d-none"}`}
          style={{
            width: "250px",
            position: "fixed",
            height: "100vh",
            overflowY: "auto",
            zIndex: 1000
          }}
        >
          <div className="p-3 border-bottom border-secondary">
            <h5 className="mb-1">DeCiFlow</h5>
            <small className="text-muted">{role}</small>
          </div>

          <div className="list-group list-group-flush">
            {getMenuItems().map((item) => (
              <button
                key={item.id}
                className={`list-group-item list-group-item-action bg-dark text-white border-0 ${currentPage === item.id ? "active" : ""
                  }`}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-top border-secondary mt-auto">
            <small className="text-muted">Connected:</small>
            <div className="text-white small font-monospace">
              {shortenAddress(account)}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: account && sidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s"
        }}
      >
        {/* Top Navbar */}
        <nav className="navbar navbar-dark bg-dark sticky-top">
          <div className="container-fluid">
            <div className="d-flex align-items-center">
              {account && (
                <button
                  className="btn btn-sm btn-outline-light me-3"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
              )}
              <span className="navbar-brand mb-0 h1">
                📦 Supply Chain DApp
              </span>
            </div>

            <button
              className="btn btn-light"
              onClick={connectWallet}
            >
              {account ? (
                <>
                  <span className="badge bg-success me-2">{role}</span>
                  {shortenAddress(account)}
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container-fluid p-4">
          {account ? (
            renderPage()
          ) : (
            <div className="text-center py-5">
              <h1>Welcome to DeCiFlow</h1>
              <p className="lead">Connect your wallet to get started</p>
              <button
                className="btn btn-primary btn-lg"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
