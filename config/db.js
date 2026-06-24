const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'store.db');
let _raw = null;
let inTrans = false;

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    _raw = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    _raw = new SQL.Database();
  }
  _raw.run('PRAGMA foreign_keys = ON');
  _raw.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, address TEXT DEFAULT '', role TEXT DEFAULT 'customer', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  _raw.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '', price REAL NOT NULL, category TEXT NOT NULL, image TEXT DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  _raw.run(`CREATE TABLE IF NOT EXISTS cart_items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (product_id) REFERENCES products(id), UNIQUE(user_id, product_id))`);
  _raw.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, order_date DATETIME DEFAULT CURRENT_TIMESTAMP, status TEXT DEFAULT 'Pending', shipping_address TEXT NOT NULL, delivery_method TEXT NOT NULL, subtotal REAL NOT NULL, tax REAL NOT NULL, total REAL NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))`);
  _raw.run(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, product_name TEXT NOT NULL, product_price REAL NOT NULL, quantity INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id))`);
  _raw.run(`CREATE TABLE IF NOT EXISTS order_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, admin_id INTEGER NOT NULL, from_status TEXT DEFAULT '', to_status TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (admin_id) REFERENCES users(id))`);
  save();
  return api();
}

function save() {
  if (_raw && !inTrans) fs.writeFileSync(dbPath, Buffer.from(_raw.export()));
}

function query(sql, ...params) {
  const stmt = _raw.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, ...params) {
  const rows = query(sql, ...params);
  return rows.length > 0 ? rows[0] : undefined;
}

function execute(sql, ...params) {
  _raw.run(sql, params);
  const rows = query('SELECT last_insert_rowid() as id, changes() as changes');
  save();
  return { lastInsertRowid: rows[0]?.id ?? null, changes: rows[0]?.changes ?? 0 };
}

function exec(sql) {
  _raw.exec(sql);
  save();
}

function transact(fn) {
  _raw.run('BEGIN');
  inTrans = true;
  try {
    const r = fn();
    _raw.run('COMMIT');
    inTrans = false;
    save();
    return r;
  } catch (e) {
    _raw.run('ROLLBACK');
    inTrans = false;
    save();
    throw e;
  }
}

function api() {
  return { query, queryOne, execute, exec, transact, save };
}

module.exports = { initDb, db: api };
