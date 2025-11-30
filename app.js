// // app.js – main UI logic for the DApp
// import { ethers } from "ethers";
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./src/utils/contractInfo";

// let provider;
// let signer;
// let contract;
// let currentAccount = null;

// /*************************************************
//  * 2. WALLET CONNECTION (Brave + MetaMask)
//  *************************************************/
// async function connectWallet() {
//   try {
//     if (!window.ethereum) {
//       alert("No wallet detected. Enable Brave Wallet or install MetaMask.");
//       return;
//     }
//     setStatus("Connecting to wallet...");
//     const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//     currentAccount = accounts[0];
//     document.getElementById("walletAddress").textContent = currentAccount;
//     provider = new ethers.providers.Web3Provider(window.ethereum, "any");
//     signer = provider.getSigner();
//     contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
//     setStatus("🔗 Wallet connected successfully!");
//     const role = detectRole(currentAccount);
//     showDashboardForRole(role);
//   } catch (error) {
//     console.error("Wallet connection error:", error);
//     setStatus("⚠ Wallet connection failed. Check permissions.");
//   }
// }

// /*************************************************
//  * 3. ROLE SYSTEM
//  *************************************************/
// const MANUFACTURER_ADDRESSES = ["0xExampleManufacturerWallet".toLowerCase()];
// const DISTRIBUTOR_ADDRESSES = ["0xExampleDistributorWallet".toLowerCase()];

// function detectRole(address) {
//   address = address.toLowerCase();
//   if (MANUFACTURER_ADDRESSES.includes(address)) return "manufacturer";
//   if (DISTRIBUTOR_ADDRESSES.includes(address)) return "distributor";
//   return "customer";
// }

// function showDashboardForRole(role) {
//   document.getElementById("manufacturerDashboard").classList.add("hidden");
//   document.getElementById("distributorDashboard").classList.add("hidden");
//   document.getElementById("customerDashboard").classList.add("hidden");
//   if (role === "manufacturer")
//     document.getElementById("manufacturerDashboard").classList.remove("hidden");
//   else if (role === "distributor")
//     document.getElementById("distributorDashboard").classList.remove("hidden");
//   else
//     document.getElementById("customerDashboard").classList.remove("hidden");
//   document.getElementById("userRole").innerText = role.toUpperCase();
// }

// /*************************************************
//  * 4. HELPER
//  *************************************************/
// function setStatus(msg) {
//   document.getElementById("statusMessage").innerText = msg;
// }

// /*************************************************
//  * 5. SEARCH PRODUCT
//  *************************************************/
// async function searchProduct() {
//   if (!contract) return alert("Connect wallet first.");
//   const id = document.getElementById("searchProductId").value;
//   try {
//     const history = await contract.getProductHistory(id);
//     document.getElementById("searchResult").innerText =
//       history.length > 0 ? `✔ Product Found (${history.length} logs)` : "❌ Not Found";
//     document.getElementById("historyResult").innerText = history.join("\n");
//   } catch (err) {
//     console.error(err);
//   }
// }

// /*************************************************
//  * 6. CREATE PRODUCT
//  *************************************************/
// async function createProduct(e) {
//   e.preventDefault();
//   if (!contract) return alert("Connect wallet first.");
//   const id = createProductId.value; // kept for UI compatibility
//   const name = createProductName.value;
//   const batch = createProductBatch.value;
//   const serial = createProductSerial.value;
//   const params = {
//     name,
//     serialNumber: serial,
//     batchNumber: batch,
//     category: 0, // DryGoods – UI could expose selector later
//     quantity: 1,
//     unitCost: ethers.utils.parseEther("0.001"),
//     expiryDate: 0,
//     requiresTemperatureControl: false,
//     minTemperature: 0,
//     maxTemperature: 0
//   };
//   try {
//     setStatus("⏳ Creating...");
//     const tx = await contract.createProduct(params);
//     await tx.wait();
//     setStatus("✅ Product Created!");
//   } catch (err) {
//     console.error(err);
//     setStatus("❌ Error creating product.");
//   }
// }

// /*************************************************
//  * 7. TRANSFER PRODUCT
//  *************************************************/
// async function transferProduct(e) {
//   e.preventDefault();
//   if (!contract) return alert("Connect wallet first.");
//   const id = transferProductId.value;
//   const to = transferTo.value;
//   try {
//     setStatus("⏳ Transferring...");
//     const tx = await contract.transferProduct(id, to);
//     await tx.wait();
//     setStatus("✅ Transfer Completed!");
//   } catch (err) {
//     console.error(err);
//     setStatus("❌ Transfer failed.");
//   }
// }

// /*************************************************
//  * 8. VERIFY PRODUCT (optional helper)
//  *************************************************/
// async function verifyProduct() {
//   const id = verifyProductId.value;
//   try {
//     const valid = await contract.verifyProduct(id);
//     verifyResult.innerText = valid ? "🟢 Authentic Product" : "🔴 Fake Product";
//   } catch {
//     verifyResult.innerText = "⚠ Verification failed.";
//   }
// }

// /*************************************************
//  * 9. EVENT LISTENERS
//  *************************************************/
// window.onload = () => {
//   connectButton.onclick = connectWallet;
//   searchButton.onclick = searchProduct;
//   verifyButton.onclick = verifyProduct;
//   createProductForm?.addEventListener("submit", createProduct);
//   transferProductForm?.addEventListener("submit", transferProduct);
// };

// src/app.js
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./utils/contractInfo.js"; // ensure this file exists and exports these

// UI elements (assume these ids exist in your index.html)
const connectButton = document.getElementById("connectButton");
const createProductForm = document.getElementById("createProductForm");
const transferProductForm = document.getElementById("transferProductForm");
const searchButton = document.getElementById("searchButton");
const verifyButton = document.getElementById("verifyButton");
const createProductId = document.getElementById("createProductId");
const createProductName = document.getElementById("createProductName");
const createProductBatch = document.getElementById("createProductBatch");
const createProductSerial = document.getElementById("createProductSerial");
const transferProductId = document.getElementById("transferProductId");
const transferTo = document.getElementById("transferTo");
const verifyProductId = document.getElementById("verifyProductId");
const verifyResult = document.getElementById("verifyResult");

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./utils/contractInfo.js"; // adjust path if needed

window.ethers = ethers;
window.CONTRACT_ADDRESS = CONTRACT_ADDRESS;
window.CONTRACT_ABI = CONTRACT_ABI;


let provider;
let signer;
let contract;
let currentAccount = null;

/*************************************************
 * 2. WALLET CONNECTION (robust detection)
 *************************************************/
async function connectWallet() {
  try {
    // robust provider detection
    const injectedProvider = window.ethereum || (window.web3 && window.web3.currentProvider);

    console.log("Injected provider:", injectedProvider);

    if (!injectedProvider) {
      // no injected provider at all
      const install = confirm(
        "No Ethereum wallet detected in the browser. Install MetaMask?\n\n(You must open the app at http://localhost:5173, not a file:// URL.)"
      );
      if (install) {
        window.open("https://metamask.io/download.html", "_blank");
      }
      return;
    }

    // Use ethers to wrap the injected provider
    provider = new ethers.providers.Web3Provider(injectedProvider, "any");

    // Request accounts (this will trigger MetaMask / Brave popup)
    setStatus("Requesting account access...");
    try {
      // attempt to request accounts; some wallets require eth_requestAccounts
      const accounts = await injectedProvider.request
        ? await injectedProvider.request({ method: "eth_requestAccounts" })
        : await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        setStatus("⚠ Wallet locked or no accounts. Unlock wallet and try again.");
        return;
      }
      currentAccount = accounts[0];
    } catch (innerErr) {
      console.error("User rejected account access or RPC error:", innerErr);
      setStatus("⚠ Wallet access denied.");
      return;
    }

    // set UI wallet address
    document.getElementById("walletAddress").textContent = currentAccount;

    // signer & contract
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    setStatus("🔗 Wallet connected");
    console.log("Connected account:", currentAccount);

    // optional: listen for account/network changes
    if (injectedProvider.on) {
      injectedProvider.on("accountsChanged", (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts.length === 0) {
          setStatus("⚠ Wallet disconnected");
          currentAccount = null;
        } else {
          currentAccount = accounts[0];
          document.getElementById("walletAddress").textContent = currentAccount;
          setStatus("🔁 Account changed");
        }
      });
      injectedProvider.on("chainChanged", (chainId) => {
        console.log("chainChanged", chainId);
        setStatus(`Network changed (chain ${chainId}). Reloading...`);
        // optional: window.location.reload();
      });
    }

    // post-connection UI
    const role = detectRole(currentAccount);
    showDashboardForRole(role);
  } catch (error) {
    console.error("Wallet connection error:", error);
    setStatus("⚠ Wallet connection failed. See console for details.");
  }
}

/*************************************************
 * 3. ROLE SYSTEM (unchanged)
 *************************************************/
const MANUFACTURER_ADDRESSES = ["0xExampleManufacturerWallet".toLowerCase()];
const DISTRIBUTOR_ADDRESSES = ["0xExampleDistributorWallet".toLowerCase()];

function detectRole(address) {
  if (!address) return "customer";
  address = address.toLowerCase();
  if (MANUFACTURER_ADDRESSES.includes(address)) return "manufacturer";
  if (DISTRIBUTOR_ADDRESSES.includes(address)) return "distributor";
  return "customer";
}

function showDashboardForRole(role) {
  const ids = ["manufacturerDashboard", "distributorDashboard", "customerDashboard"];
  ids.forEach(id => document.getElementById(id)?.classList.add("hidden"));

  if (role === "manufacturer") document.getElementById("manufacturerDashboard")?.classList.remove("hidden");
  else if (role === "distributor") document.getElementById("distributorDashboard")?.classList.remove("hidden");
  else document.getElementById("customerDashboard")?.classList.remove("hidden");

  document.getElementById("userRole").innerText = role.toUpperCase();
}

/*************************************************
 * 4. HELPER
 *************************************************/
function setStatus(msg) {
  const el = document.getElementById("statusMessage");
  if (el) el.innerText = msg;
  console.log("[STATUS]", msg);
}

/*************************************************
 * 5. SEARCH PRODUCT
 *************************************************/
async function searchProduct() {
  if (!contract) return alert("Connect wallet first.");
  const id = document.getElementById("searchProductId").value;
  try {
    const history = await contract.getProductHistory(id);
    const humanHistory = history.map(h => (typeof h === "object" && h.toString ? h.toString() : h)).join("\n");
    document.getElementById("searchResult").innerText =
      history.length > 0 ? `✔ Product Found (${history.length} logs)` : "❌ Not Found";
    document.getElementById("historyResult").innerText = humanHistory;
  } catch (err) {
    console.error(err);
    setStatus("❌ Error fetching product history. See console.");
  }
}

/*************************************************
 * 6. CREATE PRODUCT
 *************************************************/
async function createProduct(e) {
  e.preventDefault();
  if (!contract) return alert("Connect wallet first.");
  const name = createProductName?.value || "Unnamed";
  const batch = createProductBatch?.value || "";
  const serial = createProductSerial?.value || "";
  const params = {
    name,
    serialNumber: serial,
    batchNumber: batch,
    category: 0,
    quantity: 1,
    unitCost: ethers.utils.parseEther("0.001"),
    expiryDate: 0,
    requiresTemperatureControl: false,
    minTemperature: 0,
    maxTemperature: 0
  };
  try {
    setStatus("⏳ Creating product...");
    const tx = await contract.createProduct(params);
    await tx.wait();
    setStatus("✅ Product Created!");
  } catch (err) {
    console.error(err);
    setStatus("❌ Error creating product. See console.");
  }
}

/*************************************************
 * 7. TRANSFER PRODUCT
 *************************************************/
async function transferProduct(e) {
  e.preventDefault();
  if (!contract) return alert("Connect wallet first.");
  const id = transferProductId?.value;
  const to = transferTo?.value;
  try {
    setStatus("⏳ Transferring...");
    const tx = await contract.transferProduct(id, to);
    await tx.wait();
    setStatus("✅ Transfer Completed!");
  } catch (err) {
    console.error(err);
    setStatus("❌ Transfer failed.");
  }
}

/*************************************************
 * 8. VERIFY PRODUCT (optional helper)
 *************************************************/
async function verifyProduct() {
  if (!contract) return alert("Connect wallet first.");
  const id = verifyProductId?.value;
  try {
    const valid = await contract.verifyProduct(id);
    verifyResult.innerText = valid ? "🟢 Authentic Product" : "🔴 Fake Product";
  } catch (e) {
    console.error(e);
    verifyResult.innerText = "⚠ Verification failed.";
  }
}

/*************************************************
 * 9. EVENT LISTENERS
 *************************************************/
window.onload = () => {
  if (connectButton) connectButton.onclick = connectWallet;
  if (searchButton) searchButton.onclick = searchProduct;
  if (verifyButton) verifyButton.onclick = verifyProduct;
  createProductForm?.addEventListener("submit", createProduct);
  transferProductForm?.addEventListener("submit", transferProduct);
};
