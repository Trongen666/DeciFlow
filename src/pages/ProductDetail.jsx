import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const STAGE_NAMES = [
  'Created', 'InTransit', 'Stored', 'Delivered', 'Consumed', 'Spoiled'
];

const ProductDetail = ({ productId, Link }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}/lifecycle`);
        const json = await res.json();
        setHistory(json.lifecycle || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [productId]);

  const latestIndex = history ? history.length - 1 : -1;

  return (
    <Container className="py-4">
      <Row>
        <Col md={10} className="mx-auto">
          <h2>Product #{productId} — Lifecycle</h2>

          {loading && <div className="p-4 text-center"><Spinner /> Loading lifecycle…</div>}

          {!loading && (!history || history.length === 0) && (
            <Card className="p-4">
              No lifecycle information available yet. Try creating a product and advancing stages on-chain.
            </Card>
          )}

          {!loading && history && history.length > 0 && (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-3 align-items-start flex-wrap">
                {history.map((h, idx) => {
                  const completed = idx < latestIndex;
                  const isCurrent = idx === latestIndex;
                  return (
                    <div key={idx} className={`p-3 border rounded ${completed ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ minWidth: 180 }}>
                      <div><strong>{h.name || STAGE_NAMES[h.stage] || `Stage ${h.stage}`}</strong></div>
                      <div className="small">By: {h.actor && h.actor.substring ? `${h.actor.substring(0,6)}...${h.actor.substring(38)}` : h.actor}</div>
                      <div className="small">When: {dayjs.unix(Number(h.timestamp)).format('YYYY-MM-DD HH:mm:ss')}</div>
                      {h.note && <div className="mt-2 small"><em>{h.note}</em></div>}
                      {isCurrent && <div className="mt-2 badge bg-warning text-dark">Current</div>}
                    </div>
                  );
                })}
              </div>

              <Card className="p-3"><strong>Time-in-stage:</strong> Latest stage started at {history.length ? dayjs.unix(Number(history[history.length-1].timestamp)).fromNow() : '—'}</Card>

              <div>
                {Link && <Link to="/products" className="btn btn-outline-secondary">Back to Inventory</Link>}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
