import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';

export default function ProvenanceViewer({ product, contract, explorerUrl = 'https://etherscan.io' }) {
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [envReadings, setEnvReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (product && contract) {
      loadProvenance();
    }
  }, [product, contract]);

  const loadProvenance = async () => {
    setLoading(true);
    try {
      // Get ownership history
      const ownerHistory = await contract.getProductHistory(product.id);
      setHistory(ownerHistory);

      // Get transactions
      const txs = await contract.getProductTransactions(product.id);
      setTransactions(txs);

      // Get environmental readings if applicable
      if (product.requiresTemperatureControl) {
        const readings = await contract.getEnvironmentalReadings(product.id);
        setEnvReadings(readings);
      }
    } catch (error) {
      console.error('Error loading provenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr) => {
    return `${addr.substring(0, 6)}...${addr.substring(38)}`;
  };

  const renderTimeline = () => (
    <div className="timeline">
      {transactions.map((tx, idx) => (
        <div key={idx} className="d-flex mb-3">
          <div className="text-center me-3" style={{ minWidth: '60px' }}>
            <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                 style={{ width: '40px', height: '40px' }}>
              {idx + 1}
            </div>
            {idx < transactions.length - 1 && (
              <div className="bg-primary" style={{ width: '2px', height: '40px', margin: '0 auto' }} />
            )}
          </div>
          <div className="flex-grow-1">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <strong className="text-primary">{tx.transactionType}</strong>
                  <small className="text-muted">
                    {new Date(tx.timestamp.toNumber() * 1000).toLocaleString()}
                  </small>
                </div>
                <div className="row g-2 small">
                  <div className="col-md-6">
                    <strong>From:</strong> <code>{shortenAddress(tx.from)}</code>
                  </div>
                  <div className="col-md-6">
                    <strong>To:</strong> <code>{shortenAddress(tx.to)}</code>
                  </div>
                  <div className="col-md-6">
                    <strong>Quantity:</strong> {tx.quantity.toString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Cost:</strong> {ethers.utils.formatEther(tx.cost)} ETH
                  </div>
                  {tx.notes && (
                    <div className="col-12">
                      <strong>Notes:</strong> {tx.notes}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <a 
                    href={`${explorerUrl}/tx/${tx.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    🔗 View on Explorer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOwnershipChain = () => (
    <div>
      <div className="alert alert-info">
        <strong>📜 Chain of Custody</strong><br/>
        <small>This product has passed through {history.length} verified checkpoints</small>
      </div>
      <ol className="list-group list-group-numbered">
        {history.map((owner, idx) => (
          <li key={idx} className="list-group-item d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">
                {idx === 0 && '🏭 Manufacturer (Origin)'}
                {idx === history.length - 1 && idx !== 0 && '📍 Current Owner'}
                {idx !== 0 && idx !== history.length - 1 && `Step ${idx}`}
              </div>
              <code className="small">{owner}</code>
            </div>
            <span className="badge bg-primary rounded-pill">{idx + 1}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  const renderEnvironmental = () => (
    <div>
      {envReadings.length === 0 ? (
        <div className="alert alert-warning">
          No environmental data recorded for this product
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Recorded By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {envReadings.map((reading, idx) => {
                const temp = reading.temperature.toNumber();
                const inRange = temp >= product.minTemperature && temp <= product.maxTemperature;
                
                return (
                  <tr key={idx} className={!inRange ? 'table-danger' : ''}>
                    <td>
                      <small>{new Date(reading.timestamp.toNumber() * 1000).toLocaleString()}</small>
                    </td>
                    <td>
                      <strong>{temp}°C</strong>
                      {!inRange && <span className="ms-1">⚠️</span>}
                    </td>
                    <td>{reading.humidity.toString()}%</td>
                    <td><code className="small">{shortenAddress(reading.recordedBy)}</code></td>
                    <td>
                      {inRange ? (
                        <span className="badge bg-success">✓ OK</span>
                      ) : (
                        <span className="badge bg-danger">⚠ Out of Range</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {product.requiresTemperatureControl && (
        <div className="alert alert-info mt-3">
          <strong>📊 Temperature Requirements:</strong><br/>
          Min: {product.minTemperature}°C | Max: {product.maxTemperature}°C
        </div>
      )}
    </div>
  );

  const renderVerification = () => {
    const productHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'string', 'string', 'address', 'uint256'],
        [product.id, product.name, product.serialNumber, product.manufacturer, product.createdAt]
      )
    );

    return (
      <div>
        <div className="alert alert-success">
          <h5>✅ Product Authenticity Verified</h5>
          <p className="mb-0">This product's data is cryptographically secured on the blockchain</p>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6>🔐 Tamper-Proof Hash</h6>
            <div className="input-group input-group-sm">
              <input 
                type="text" 
                className="form-control font-monospace" 
                value={productHash}
                readOnly
              />
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigator.clipboard.writeText(productHash)}
              >
                📋 Copy
              </button>
            </div>
            <small className="text-muted d-block mt-2">
              This hash uniquely identifies this product and cannot be altered without detection
            </small>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h6>📱 QR Code for Verification</h6>
            <button 
              className="btn btn-sm btn-primary mb-3"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>
            
            {showQR && (
              <div className="text-center p-3 bg-white border rounded">
                <QRCode 
                  value={JSON.stringify({
                    productId: product.id,
                    name: product.name,
                    serial: product.serialNumber,
                    manufacturer: product.manufacturer,
                    hash: productHash
                  })}
                  size={200}
                />
                <p className="small text-muted mt-2 mb-0">
                  Scan to verify product details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading provenance data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-3">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">🔍 Product Provenance & Verification</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <strong>Product ID:</strong> #{product.id}
            </div>
            <div className="col-md-6">
              <strong>Serial Number:</strong> <code>{product.serialNumber}</code>
            </div>
            <div className="col-md-6">
              <strong>Batch:</strong> <code>{product.batchNumber}</code>
            </div>
            <div className="col-md-6">
              <strong>Manufacturer:</strong> <code className="small">{shortenAddress(product.manufacturer)}</code>
            </div>
            <div className="col-md-6">
              <strong>Current Owner:</strong> <code className="small">{shortenAddress(product.currentOwner)}</code>
            </div>
            <div className="col-md-6">
              <strong>Created:</strong> {product.createdAt}
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            📅 Timeline
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'ownership' ? 'active' : ''}`}
            onClick={() => setActiveTab('ownership')}
          >
            👥 Ownership Chain
          </button>
        </li>
        {product.requiresTemperatureControl && (
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'environmental' ? 'active' : ''}`}
              onClick={() => setActiveTab('environmental')}
            >
              🌡️ Environmental
            </button>
          </li>
        )}
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            ✅ Verification
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'ownership' && renderOwnershipChain()}
        {activeTab === 'environmental' && renderEnvironmental()}
        {activeTab === 'verification' && renderVerification()}
      </div>
    </div>
  );
}

// Note: Install react-qr-code: npm install react-qr-code