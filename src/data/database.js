import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "data", "db.json");

// Helper to ensure database file exists and is populated
function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    // If it somehow doesn't exist, we will create a basic schema
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify({ menu: [], orders: [], bills: [] }, null, 2), "utf8");
  }
}

export function readDb() {
  ensureDb();
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { menu: [], orders: [], bills: [] };
  }
}

export function writeDb(data) {
  ensureDb();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to database:", error);
    return false;
  }
}

export function getMenu() {
  return readDb().menu || [];
}

export function saveMenu(menu) {
  const db = readDb();
  db.menu = menu;
  return writeDb(db);
}

export function getOrders() {
  return readDb().orders || [];
}

export function saveOrder(order) {
  const db = readDb();
  if (!db.orders) db.orders = [];
  
  // Assign ID if it doesn't exist
  if (!order.id) {
    const count = db.orders.length + 1;
    order.id = `ORD-${1000 + count}`;
  }
  
  if (!order.timestamp) {
    order.timestamp = new Date().toISOString();
  }
  
  if (!order.status) {
    order.status = "pending";
  }

  // Add order
  db.orders.push(order);
  writeDb(db);
  return order;
}

export function updateOrderStatus(orderId, status) {
  const db = readDb();
  if (!db.orders) return false;
  const index = db.orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    db.orders[index].status = status;
    return writeDb(db);
  }
  return false;
}

export function getBills() {
  return readDb().bills || [];
}

export function saveBill(bill) {
  const db = readDb();
  if (!db.bills) db.bills = [];
  
  if (!bill.id) {
    const count = db.bills.length + 1;
    bill.id = `BILL-${2000 + count}`;
  }
  
  if (!bill.timestamp) {
    bill.timestamp = new Date().toISOString();
  }

  db.bills.push(bill);
  writeDb(db);
  return bill;
}
