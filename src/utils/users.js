// --- CONFIGURATION: WHO IS WHO? ---

// 1. Paste Manufacturer Address (Account 1) inside the quotes
export const MANUFACTURER_ADDRESS = "0x3391718f21ddef76f94c72fd9d956aece26f8686".toLowerCase();

// 2. Paste Distributor Address (Account 2) inside the quotes
export const DISTRIBUTOR_ADDRESS  = "0xe4b05a3707302ee47c02ad4373817332895d86ea".toLowerCase();

// 3. Paste Retailer Address (Account 3) inside the quotes
export const RETAILER_ADDRESS     = "0x04a0930572b0d2e4b3b9184babb56048ee792689".toLowerCase();

// --- LOGIC: DO NOT TOUCH BELOW THIS LINE ---
export const getRole = (address) => {
    if (!address) return "Guest";
    const addr = address.toLowerCase();
    
    if (addr === MANUFACTURER_ADDRESS) return "Manufacturer";
    if (addr === DISTRIBUTOR_ADDRESS) return "Distributor";
    if (addr === RETAILER_ADDRESS) return "Retailer";
    
    // If it doesn't match any of the above, they are a Customer
    return "Customer";
};