import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// top of src/main.js  (or src/main.jsx / src/app.js)
import { Buffer } from "buffer";
window.Buffer = Buffer;

// optional: make ethers and contract constants available globally for console checks
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./utils/contractInfo.js"; // adjust path if needed

window.ethers = ethers;
window.CONTRACT_ADDRESS = CONTRACT_ADDRESS;
window.CONTRACT_ABI = CONTRACT_ABI;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
