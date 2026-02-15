/**
 * Setup script to initialize the admin user
 * This creates or updates the admin user with the specified credentials
 */

import { neon } from "@neondatabase/serverless";

// Password hashing using Web Crypto API
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveKey(password, salt);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

async function setupAdmin() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const username = "moatsem";
  const password = "716moatsem";

  try {
    console.log(`Setting up admin user: ${username}`);

    // Hash the password
    const passwordHash = await hashPassword(password);
    console.log("Password hashed");

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      // Update existing user
      console.log(`Admin user "${username}" already exists, updating credentials...`);
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}, role = 'admin'
        WHERE username = ${username}
      `;
      console.log(`✓ Admin user "${username}" updated successfully`);
    } else {
      // Create new user
      console.log(`Creating new admin user "${username}"...`);
      const apiKey = `pk_${crypto.randomUUID().replace(/-/g, "")}`;
      await sql`
        INSERT INTO users (username, password_hash, role, api_key, balance)
        VALUES (${username}, ${passwordHash}, 'admin', ${apiKey}, 0)
      `;
      console.log(`✓ Admin user "${username}" created successfully`);
      console.log(`API Key: ${apiKey}`);
    }

    console.log("\n✓ Admin setup complete!");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
}

setupAdmin();
