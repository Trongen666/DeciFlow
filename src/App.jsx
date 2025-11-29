import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./utils/contractInfo";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  // --- STATE VARIABLES ---
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("Guest"); 
  const [status, setStatus] = useState("");

  // Input Forms
  const [productName, setProductName] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [transferId, setTransferId] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [trackId, setTrackId] = useState("");
  const [history, setHistory] = useState([]);

  // --- 1. CONNECT & LOGIN ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(tempContract);

        setStatus("Verifying Identity...");
        const userRole = await tempContract.roles(address);
        if (userRole) {
            setRole(userRole);
            setStatus(`Logged in as ${userRole}`);
        } else {
            setRole("Unregistered");
            setStatus("Please Register.");
        }
      } catch (error) { alert(error.message); }
    } else { alert("Install MetaMask"); }
  };


  // --- 2. REGISTER ---
  const registerAs = async (selectedRole) => {
      if(!contract) return;
      try {
          setStatus("Registering...");
          const tx = await contract.registerUser(selectedRole);
          await tx.wait();
          setRole(selectedRole);
          setStatus("Registration Success!");
      } catch (error) { alert(error.message); }
  };


  // --- 3. ACTIONS ---
  const createProduct = async () => {
    try {
      setStatus("Creating...");
      const tx = await contract.createProduct(productName, serialNo);
      await tx.wait();
      setStatus("Product Created!");
    } catch (error) { alert(error.message); }
  };

  const transferProduct = async () => {
    try {
      setStatus("Transferring...");
      const tx = await contract.transferProduct(transferId, transferAddress);
      await tx.wait();
      setStatus("Transfer Complete!");
    } catch (error) { alert(error.message); }
  };

  const trackProduct = async () => {
    try {
      setStatus("Scanning Blockchain...");
      const h = await contract.getProductHistory(trackId);
      setHistory(h);
      setStatus("Scan Complete.");
    } catch (error) { 
        alert("Product ID not found"); 
        setHistory([]);
    }
  };


  // --- 4. THE UI ---
  return (
    <>
      {/* FULL-WIDTH NAVBAR */}
      <nav className="navbar navbar-light bg-light shadow-sm p-3 mb-4 w-100">
         <div className="container-fluid d-flex justify-content-between">
            <h4 className="m-0">📦 SupplyChain DApp</h4>
            <button className="btn btn-dark" onClick={connectWallet}>
              {account ? `${role}: ${account.substring(0,6)}...` : "Connect Wallet"}
            </button>
         </div>
      </nav>

      <div className="container-fluid px-4">

        {status && <div className="alert alert-info text-center py-2">{status}</div>}

        {/* VIEW: REGISTER */}
        {account && role === "Unregistered" && (
            <div className="card p-5 text-center shadow-sm w-100">
                <h3>🆕 Registration</h3>
                <p>Select your role to begin:</p>
                <div className="d-grid gap-2 d-md-block">
                    <button className="btn btn-outline-primary m-1" onClick={() => registerAs("Manufacturer")}>🏭 Manufacturer</button>
                    <button className="btn btn-outline-warning m-1" onClick={() => registerAs("Distributor")}>🚚 Distributor</button>
                    <button className="btn btn-outline-secondary m-1" onClick={() => registerAs("Retailer")}>🏪 Retailer</button>
                    <button className="btn btn-outline-success m-1" onClick={() => registerAs("Customer")}>👤 Customer</button>
                </div>
            </div>
        )}

        {/* VIEW: MANUFACTURER */}
        {role === "Manufacturer" && (
            <div className="card shadow-sm w-100">
                <div className="card-header bg-primary text-white">🏭 Manufacturer Control</div>
                <div className="card-body">
                    <div className="mb-3">
                      <label>New Product Name</label>
                      <input className="form-control" onChange={e => setProductName(e.target.value)} />
                      <label>Serial Number</label>
                      <input className="form-control" onChange={e => setSerialNo(e.target.value)} />
                      <button className="btn btn-primary mt-2 w-100" onClick={createProduct}>Create</button>
                    </div>
                    <hr/>
                    <div className="mb-3">
                      <label>Transfer to Distributor</label>
                      <div className="input-group">
                          <input className="form-control" placeholder="ID" onChange={e => setTransferId(e.target.value)} />
                          <input className="form-control" placeholder="Distributor Address" onChange={e => setTransferAddress(e.target.value)} />
                          <button className="btn btn-warning" onClick={transferProduct}>Send</button>
                      </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: DISTRIBUTOR & RETAILER */}
        {(role === "Distributor" || role === "Retailer") && (
            <div className="card shadow-sm w-100">
                <div className="card-header bg-secondary text-white">
                    {role === "Distributor" ? "🚚 Distributor" : "🏪 Retailer"} Dashboard
                </div>
                <div className="card-body">

                    <div className="bg-light p-3 rounded mb-4 border w-100">
                        <h5 className="text-dark">🔍 Scan Incoming Goods</h5>
                        <p className="text-muted small">Verify product history before accepting transfer.</p>
                        <div className="input-group mb-2">
                            <input className="form-control" type="number" placeholder="Enter Product ID" onChange={e => setTrackId(e.target.value)} />
                            <button className="btn btn-dark" onClick={trackProduct}>Scan History</button>
                        </div>

                        {history.length > 0 && (
                            <div className="alert alert-white border mt-2">
                                <strong>📜 Chain of Custody:</strong>
                                <ul className="mb-0 mt-1 pl-3">
                                    {history.map((h, i) => (
                                        <li key={i} className="small text-break">
                                            Step {i+1}: {h} 
                                            {i === 0 && " (Factory)"}
                                            {i === history.length - 1 && " (Current Owner)"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <hr/>

                    <h5>➡️ Transfer Stock</h5>
                    <div className="input-group">
                        <input className="form-control" placeholder="ID" onChange={e => setTransferId(e.target.value)} />
                        <input className="form-control" placeholder={role === "Distributor" ? "Retailer Address" : "Customer Address"} onChange={e => setTransferAddress(e.target.value)} />
                        <button className="btn btn-success" onClick={transferProduct}>Transfer</button>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: CUSTOMER */}
        {role === "Customer" && (
            <div className="card shadow-sm w-100">
                <div className="card-header bg-success text-white">👤 Customer Verification</div>
                <div className="card-body text-center">
                    <h5>Is your product authentic?</h5>
                    <div className="input-group mb-3">
                      <input className="form-control" type="number" placeholder="Product ID" onChange={e => setTrackId(e.target.value)} />
                      <button className="btn btn-success" onClick={trackProduct}>Verify Now</button>
                    </div>

                    {history.length > 0 && (
                        <div className="alert alert-success text-start">
                            <h5>✅ Authentic!</h5>
                            <ul className="mb-0">
                                {history.map((h, i) => <li key={i} className="small text-break">{h}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </>
  );
}

export default App;
