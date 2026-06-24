const bcrypt = require('bcryptjs');
const { initDb, db } = require('./config/db');

async function seed() {
  await initDb();
  const d = db();

  console.log('Seeding database...');

  const adminPw = bcrypt.hashSync('admin123', 10);
  const customerPw = bcrypt.hashSync('customer1', 10);

  if (!d.queryOne('SELECT id FROM users WHERE email = ?', 'admin@store.com')) {
    d.execute('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', 'Admin', 'admin@store.com', adminPw, '123 Admin St', 'admin');
    console.log('  Created admin user (admin@store.com / admin123)');
  }

  if (!d.queryOne('SELECT id FROM users WHERE email = ?', 'alice@example.com')) {
    d.execute('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', 'Alice Johnson', 'alice@example.com', customerPw, '456 Oak Ave, Springfield', 'customer');
    console.log('  Created test customer (alice@example.com / customer1)');
  }

  const count = d.queryOne('SELECT COUNT(*) as count FROM products').count;
  if (count === 0) {
    const products = [
      ['Wireless Bluetooth Headphones',       'Premium noise-cancelling over-ear headphones with 30-hour battery life.', 79.99,  'Electronics'],
      ['USB-C Charging Cable 2m',             'Fast-charging braided USB-C cable for most smartphones and tablets.',     12.99,  'Electronics'],
      ['Portable Power Bank 10000mAh',        'Compact high-capacity power bank with dual USB output.',                   34.99,  'Electronics'],
      ['Wireless Mouse Ergonomic',            'Comfortable ergonomic design with 6 buttons and adjustable DPI.',          24.99,  'Electronics'],
      ["Men's Cotton T-Shirt",                'Soft 100% cotton crew neck t-shirt in multiple colors.',                   19.99,  'Clothing'],
      ["Women's Running Shoes",               'Lightweight breathable mesh running shoes with cushioned sole.',           89.99,  'Clothing'],
      ['Classic Denim Jacket',                'Timeless denim jacket with button front closure and chest pockets.',       65.00,  'Clothing'],
      ['Wool Blend Scarf',                    'Soft warm winter scarf in classic plaid pattern.',                         25.00,  'Clothing'],
      ['Introduction to Algorithms',          'Comprehensive guide by Cormen, Leiserson, Rivest, and Stein. 4th Ed.',     55.00,  'Books'],
      ['Clean Code',                          'A handbook of agile software craftsmanship by Robert C. Martin.',           35.99,  'Books'],
      ['The Pragmatic Programmer',            'Your journey to mastery, 20th Anniversary Edition.',                       39.99,  'Books'],
      ['Design Patterns',                     'Elements of reusable object-oriented software by the Gang of Four.',       42.50,  'Books'],
    ];
    for (const [name, desc, price, cat] of products) {
      d.execute('INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)', name, desc, price, cat);
    }
    console.log(`  Inserted ${products.length} sample products`);
  } else {
    console.log(`  ${count} products already exist, skipping`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
