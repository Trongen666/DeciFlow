/*************************************************
 * 1. GLOBAL VARIABLES
 *************************************************/
let provider;
let signer;
let contract;
let currentAccount = null;

// TODO: 🔥 REPLACE with YOUR deployed contract address
const CONTRACT_ADDRESS = "0xYourContractHere";

// TODO: 🔥 REPLACE with YOUR contract ABI (array from Remix)
const CONTRACT_ABI = []; 


/*************************************************
 * 2. WALLET CONNECTION (Brave + MetaMask)
 *************************************************/
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No wallet detected. Enable Brave Wallet or install MetaMask.");
      return;
    }

    setStatus("Connecting to wallet...");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAccount = accounts[0];
    document.getElementById("walletAddress").textContent = currentAccount;

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    setStatus("🔗 Wallet connected successfully!");

    const role = detectRole(currentAccount);
    showDashboardForRole(role);

  } catch (error) {
    console.error("Wallet connection error:", error);
    setStatus("⚠ Wallet connection failed. Check permissions.");
  }
}


/*************************************************
 * 3. ROLE SYSTEM
 *************************************************/
const MANUFACTURER_ADDRESSES = [
  "0xExampleManufacturerWallet".toLowerCase()
];

const DISTRIBUTOR_ADDRESSES = [
  "0xExampleDistributorWallet".toLowerCase()
];

function detectRole(address) {
  address = address.toLowerCase();

  if (MANUFACTURER_ADDRESSES.includes(address)) return "manufacturer";
  if (DISTRIBUTOR_ADDRESSES.includes(address)) return "distributor";

  return "customer";
}

function showDashboardForRole(role) {
  document.getElementById("manufacturerDashboard").classList.add("hidden");
  document.getElementById("distributorDashboard").classList.add("hidden");
  document.getElementById("customerDashboard").classList.add("hidden");

  if (role === "manufacturer")
    document.getElementById("manufacturerDashboard").classList.remove("hidden");
  else if (role === "distributor")
    document.getElementById("distributorDashboard").classList.remove("hidden");
  else 
    document.getElementById("customerDashboard").classList.remove("hidden");

  document.getElementById("userRole").innerText = role.toUpperCase();
}


/*************************************************
 * 4. HELPER
 *************************************************/
function setStatus(msg) {
  document.getElementById("statusMessage").innerText = msg;
}


/*************************************************
 * 5. SEARCH PRODUCT
 *************************************************/
async function searchProduct() {
  if (!contract) return alert("Connect wallet first.");

  const id = document.getElementById("searchProductId").value;

  try {
    const history = await contract.getProductHistory(id);

    document.getElementById("searchResult").innerText =
      history.length > 0 ? `✔ Product Found (${history.length} logs)` : "❌ Not Found";

    document.getElementById("historyResult").innerText = history.join("\n");

  } catch (err) {
    console.error(err);
  }
}


/*************************************************
 * 6. CREATE PRODUCT
 *************************************************/
async function createProduct(e) {
  e.preventDefault();
  if (!contract) return alert("Connect wallet first.");

  const id = createProductId.value;
  const name = createProductName.value;
  const batch = createProductBatch.value;
  const serial = createProductSerial.value;

  try {
    setStatus("⏳ Creating...");
    const tx = await contract.createProduct(id, name, batch, serial);
    await tx.wait();
    setStatus("✅ Product Created!");
  } catch (err) {
    console.error(err);
    setStatus("❌ Error creating product.");
  }
}


/*************************************************
 * 7. TRANSFER PRODUCT
 *************************************************/
async function transferProduct(e) {
  e.preventDefault();
  if (!contract) return alert("Connect wallet first.");

  const id = transferProductId.value;
  const to = transferTo.value;

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
 * 8. VERIFY PRODUCT
 *************************************************/
async function verifyProduct() {
  const id = verifyProductId.value;

  try {
    const valid = await contract.verifyProduct(id);
    verifyResult.innerText = valid ? "🟢 Authentic Product" : "🔴 Fake Product";
  } catch {
    verifyResult.innerText = "⚠ Verification failed.";
  }
}


/*************************************************
 * 9. EVENT LISTENERS
 *************************************************/
window.onload = () => {
  connectButton.onclick = connectWallet;
  searchButton.onclick = searchProduct;
  verifyButton.onclick = verifyProduct;
  createProductForm?.addEventListener("submit", createProduct);
  transferProductForm?.addEventListener("submit", transferProduct);
};
