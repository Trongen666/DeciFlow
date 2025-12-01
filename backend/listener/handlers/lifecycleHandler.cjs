const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DB_DIR, 'lifecycle.json');

function appendStep(step) {
  let data = {};
  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
  }

  if (!data[step.productId]) data[step.productId] = [];
  data[step.productId].push(step);
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = async (event) => {
  // event is the event object from ethers
  const args = event.args;
  const productId = args.productId ? args.productId.toString() : (args.id ? args.id.toString() : null);
  const stage = args.stage !== undefined ? Number(args.stage) : null;
  const name = args.name || '';
  const timestamp = args.timestamp ? Number(args.timestamp) : Math.floor(Date.now()/1000);
  const actor = args.actor || (args.manufacturer ? args.manufacturer : 'unknown');
  const note = args.note || '';

  const step = { productId, stage, name, timestamp, actor, note };
  console.log(`[LIFECYCLE HANDLER] append step for product ${productId}: ${name} stage=${stage} by ${actor}`);
  appendStep(step);
};
