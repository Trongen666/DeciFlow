// Product Categories
export const PRODUCT_CATEGORIES = {
  DryGoods: 0,
  Perishable: 1,
  Hazmat: 2,
  Bulk: 3,
  RawMaterial: 4,
  WIP: 5,
  FinishedGood: 6,
  MRO: 7,
  Packaging: 8
};

export const CATEGORY_LABELS = {
  0: "Dry Goods",
  1: "Perishable",
  2: "Hazmat",
  3: "Bulk",
  4: "Raw Material",
  5: "Work-in-Progress",
  6: "Finished Good",
  7: "MRO Supplies",
  8: "Packaging"
};

// User Roles
export const ROLES = {
  Guest: 0,
  Manufacturer: 1,
  Distributor: 2,
  Retailer: 3,
  Customer: 4,
  Admin: 5
};

export const ROLE_LABELS = {
  0: "Guest",
  1: "Manufacturer",
  2: "Distributor",
  3: "Retailer",
  4: "Customer",
  5: "Admin"
};

// Alert Types
export const ALERT_TYPES = {
  Temperature: 0,
  Humidity: 1,
  Expiry: 2,
  LowStock: 3,
  Unauthorized: 4,
  Compliance: 5
};

export const ALERT_LABELS = {
  0: "Temperature Alert",
  1: "Humidity Alert",
  2: "Expiry Alert",
  3: "Low Stock Alert",
  4: "Unauthorized Access",
  5: "Compliance Issue"
};

// Permissions Matrix
export const PERMISSIONS = {
  CREATE_PRODUCT: [ROLES.Manufacturer],
  TRANSFER_PRODUCT: [ROLES.Manufacturer, ROLES.Distributor, ROLES.Retailer],
  VIEW_PRODUCT: [ROLES.Manufacturer, ROLES.Distributor, ROLES.Retailer, ROLES.Customer],
  RECORD_ENVIRONMENTAL: [ROLES.Manufacturer, ROLES.Distributor, ROLES.Retailer],
  VIEW_FINANCIALS: [ROLES.Manufacturer, ROLES.Admin],
  MANAGE_USERS: [ROLES.Admin],
  RESOLVE_ALERTS: [ROLES.Manufacturer, ROLES.Distributor, ROLES.Retailer, ROLES.Admin],
  VIEW_ANALYTICS: [ROLES.Manufacturer, ROLES.Distributor, ROLES.Admin]
};

export const CONTRACT_ADDRESS = "0x0Ed5eB26D9A40A76A09BEAd743529Ca506BfE5DA";

// Temperature thresholds by category (Celsius)
export const TEMP_REQUIREMENTS = {
  [PRODUCT_CATEGORIES.Perishable]: { min: 2, max: 8, label: "Refrigerated (2-8°C)" },
  [PRODUCT_CATEGORIES.Hazmat]: { min: 15, max: 25, label: "Room Temp (15-25°C)" },
  [PRODUCT_CATEGORIES.DryGoods]: { min: 10, max: 30, label: "Ambient (10-30°C)" }
};

export const TRANSACTION_TYPES = [
  "Transfer",
  "Purchase",
  "Sale",
  "Return",
  "Quality Check",
  "Storage",
  "Processing"
];

export const STATUS_COLORS = {
  active: "success",
  warning: "warning",
  critical: "danger",
  inactive: "secondary"
};