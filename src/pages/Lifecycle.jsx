import React, { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';

const Lifecycle = ({ contracts }) => {
  const [steps, setSteps] = useState([]);
  const [productId, setProductId] = useState('');
  const [status, setStatus] = useState('');

  const loadSteps = async () => {
    if (!productId) return setStatus('Enter a product id');
    try {
      setStatus('Fetching lifecycle steps...');
      const raw = await fetch(`/api/products/${productId}/lifecycle`);
      if (raw.ok) {
        const data = await raw.json();
        setSteps(data.lifecycle || []);
        setStatus('');
      } else {
        setStatus('No lifecycle data for this product.');
      }
    } catch (e) {
      console.error(e);
      setStatus('Error loading lifecycle.');
    }
  };

  return (
    <Container className="py-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h5 className="m-0">🔄 Product Lifecycle</h5>
        </div>
        <div className="card-body">
          {status && <div className="alert alert-info">{status}</div>}

          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <button className="btn btn-primary" onClick={loadSteps}>
              Load Steps
            </button>
          </div>

          {steps.length > 0 && (
            <ul className="list-group">
              {steps.map((s, i) => (
                <li key={i} className="list-group-item">
                  <strong>{s.name || `Stage ${s.stage}`}</strong> – {new Date(s.timestamp * 1000).toLocaleString()}
                  {s.note && <div className="small text-muted">{s.note}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Lifecycle;
