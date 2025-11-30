import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

const CreateProduct = ({ Link }) => {
  const { account, connectWallet } = useWeb3();
  const { contract: accessControl } = useContract('AccessControl');
  const { call: callSupply, loading, error } = useContract('SupplyChain');

  const [form, setForm] = useState({
    name: '', serialNumber: '', batchNumber: '', category: 0, quantity: 1, unitCost: '0.01', expiryDate: '', requiresTemperatureControl: false, minTemperature: 0, maxTemperature: 0
  });
  const [msg, setMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!account) return connectWallet();

    try {
      // check manufacturer role via AccessControl if available
      if (accessControl) {
        const MANUFACTURER_ROLE = await accessControl.MANUFACTURER_ROLE();
        const ok = await accessControl.hasRole(MANUFACTURER_ROLE, account);
        if (!ok) {
          setMsg({ variant: 'warning', text: 'Your wallet is not registered as Manufacturer. Only Manufacturer can create products.' });
          return;
        }
      }

      // prepare params matching IStructs.ProductParams
      const params = {
        name: form.name,
        serialNumber: form.serialNumber,
        batchNumber: form.batchNumber,
        category: Number(form.category),
        quantity: Number(form.quantity),
        unitCost: ethers.utils.parseEther(String(form.unitCost || '0')).toString(),
        expiryDate: form.expiryDate ? Math.floor(new Date(form.expiryDate).getTime() / 1000) : 0,
        requiresTemperatureControl: Boolean(form.requiresTemperatureControl),
        minTemperature: Number(form.minTemperature),
        maxTemperature: Number(form.maxTemperature)
      };

      setMsg({ variant: 'info', text: 'Sending transaction — this may ask for gas confirmation in MetaMask.' });
      await callSupply('createProduct', params);
      setMsg({ variant: 'success', text: 'Product created successfully — refresh inventory or dashboard.' });

    } catch (err) {
      console.error(err);
      setMsg({ variant: 'danger', text: err.message || String(err) });
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8} className="mx-auto">
          <h2>Create Product</h2>
          <p className="text-muted">Only manufacturer role is allowed to create products — the contract enforces this.</p>

          {msg && <Alert variant={msg.variant}>{msg.text}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Serial Number</Form.Label>
              <Form.Control value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Batch Number</Form.Label>
              <Form.Control value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value={0}>DryGoods</option>
                <option value={1}>Perishable</option>
                <option value={2}>Hazmat</option>
                <option value={3}>Bulk</option>
                <option value={4}>RawMaterial</option>
                <option value={5}>WIP</option>
                <option value={6}>FinishedGood</option>
                <option value={7}>MRO</option>
                <option value={8}>Packaging</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} min={1} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Unit Cost (ETH)</Form.Label>
              <Form.Control value={form.unitCost} onChange={e => setForm({...form, unitCost: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Expiry Date (optional)</Form.Label>
              <Form.Control type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
            </Form.Group>

            <Form.Check className="mb-2" label="Requires Temperature Control" checked={form.requiresTemperatureControl} onChange={e => setForm({...form, requiresTemperatureControl: e.target.checked})} />
            {form.requiresTemperatureControl && (
              <div className="d-flex gap-2 mb-2">
                <Form.Control type="number" value={form.minTemperature} onChange={e => setForm({...form, minTemperature: Number(e.target.value)})} placeholder="min temp (°C)" />
                <Form.Control type="number" value={form.maxTemperature} onChange={e => setForm({...form, maxTemperature: Number(e.target.value)})} placeholder="max temp (°C)" />
              </div>
            )}

            <div className="d-flex gap-2">
              <Button type="submit" disabled={loading} variant="primary">{loading ? 'Sending...' : 'Create'}</Button>
              {Link && <Link to="/products" className="btn btn-outline-secondary">View Inventory</Link>}
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateProduct;
