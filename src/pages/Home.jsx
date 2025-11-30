import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import { getRole } from '../utils/users';

const Home = ({ Link }) => {
  const { account, connectWallet, contracts, chainId } = useWeb3();
  const role = getRole(account);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col md={7}>
          <h1 className="display-5">DeciFlow — Transparent Supply Chain on-chain</h1>
          <p className="lead">Track products end-to-end with blockchain-backed provenance, alerts and role-based controls.
             Register users, create inventory, transfer ownership and record environmental data — all verifiable on-chain.</p>

          <div className="mb-3">
            {!account ? (
              <Button size="lg" variant="primary" onClick={connectWallet}>Connect Wallet</Button>
            ) : (
              <div className="d-flex gap-2 align-items-center">
                <div className="bg-secondary text-white px-3 py-2 rounded">Connected: {account.substring(0,6)}...{account.substring(38)}</div>
                <div className="badge bg-info text-dark">Role (static demo): {role}</div>
                <div className="ms-2 small text-muted">chain: {chainId || 'unknown'}</div>
              </div>
            )}
          </div>

          <div className="d-flex gap-2">
            <Link to="/create" className="btn btn-primary">Create Product</Link>
            <Link to="/products" className="btn btn-outline-primary">View Inventory</Link>
            <Link to="/dashboard" className="btn btn-outline-dark">Open Dashboard</Link>
          </div>

        </Col>
        <Col md={5}>
          <Card className="p-3 shadow-sm">
            <h5>How it works</h5>
            <ol>
              <li>Register a user (role assigned on-chain via AccessControl).</li>
              <li>Manufacturers create products on-chain (only manufacturer role allowed).</li>
              <li>Transfer products between participants; environmental readings trigger alerts when thresholds breached.</li>
            </ol>
            <small className="text-muted">Note: The demo maps a few addresses to roles in <code>src/utils/users.js</code>. The smart contracts implement AccessControl for real enforcement.</small>
            <div className="mt-2">
              <strong>Contracts:</strong>
              <div className="small text-muted">SupplyChain: {contracts && contracts.SupplyChain ? 'loaded' : 'not loaded'}</div>
              <div className="small text-muted">AccessControl: {contracts && contracts.AccessControl ? 'loaded' : 'not loaded'}</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Role-based Access</h5>
              <p>
                AccessControl contract defines roles like <strong>Manufacturer</strong>, <strong>Distributor</strong>, and <strong>Retailer</strong>.
                Smart contracts only allow actions like creating a product if the caller has the correct on-chain role.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Security & Provenance</h5>
              <p>Every product action is recorded on-chain. Environmental alerts are triggered automatically by contract logic.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Quick Start</h5>
              <ol>
                <li>Connect your wallet</li>
                <li>Ensure your account is registered with an appropriate role</li>
                <li>Use Create Product (Manufacturer only) or view inventory</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
