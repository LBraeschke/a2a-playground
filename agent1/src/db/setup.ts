import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database in the project root
const dbDir = path.join(__dirname, "..", "..", "db");
const dbPath = path.join(dbDir, "data.db");

// Create directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
export const db = new Database(dbPath, { verbose: console.log });

// Initialize tables
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      cake_name TEXT PRIMARY KEY,
      description TEXT
    );
  `);

  // Seed with cake data if table is empty
  const count = db.prepare("SELECT COUNT(*) as count FROM store").get() as {
    count: number;
  };
  if (count.count === 0) {
    db.exec(`
      INSERT INTO store (cake_name, description) VALUES
        ('chocolate_cake', 'Rich, moist chocolate layers with dark chocolate ganache'),
        ('red_velvet', 'Classic red velvet with cream cheese frosting'),
        ('carrot_cake', 'Spiced carrot cake with walnuts and cream cheese icing'),
        ('cheesecake', 'New York style creamy cheesecake with graham crust'),
        ('tiramisu', 'Italian coffee-soaked ladyfingers with mascarpone cream'),
        ('black_forest', 'Chocolate sponge with cherries and whipped cream');
    `);
    console.log("Database seeded with cake data");
  }

  console.log("Database initialized successfully");
}

// Run initialization immediately so tables exist before key-value.ts prepares statements
initializeDatabase();
