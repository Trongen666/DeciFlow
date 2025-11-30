import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';
import HealthCheckPanel from '../components/HealthCheckPanel';

const Dashboard = () => {
    const { account, connectWallet } = useWeb3();
    const { contract: supplyChain } = useContract('SupplyChain');
    const [productCount, setProductCount] = useState(0);

    useEffect(() => {
        if (supplyChain) {
            supplyChain.productCount().then(c => setProductCount(c.toString()));
        }
    }, [supplyChain]);

    if (!account) {
        return (
            <Container className="text-center mt-5">
                <h1>Welcome to SupplyChain DApp</h1>
                <p>Please connect your wallet to continue.</p>
                <Button onClick={connectWallet} size="lg">Connect Wallet</Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Dashboard</h2>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>{productCount}</h3>
                            <p>Total Products</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>0</h3>
                            <p>Active Alerts</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>Connected</h3>
                            <p>{account.substring(0, 6)}...{account.substring(38)}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <Card>
                        <Card.Header>System Health</Card.Header>
                        <Card.Body>
                            <HealthCheckPanel />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card>
                        <Card.Header>Quick Actions</Card.Header>
                        <Card.Body className="d-grid gap-2">
                            <Button variant="primary" href="/create">Create Product</Button>
                            <Button variant="outline-primary" href="/products">View Inventory</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
