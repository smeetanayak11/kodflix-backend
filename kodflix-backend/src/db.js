import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Aiven CA Certificate
const AIVEN_CA_CERT = `-----BEGIN CERTIFICATE-----
MIIERDCCAqygAwIBAgIUIZDdYKJDbe/tFWkgcg9A0wPTnRIwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvYWYxOTZhMzQtY2MzNi00YTQwLWI0ZjMtNmMyMTcxN2M5
ZDEzIFByb2plY3QgQ0EwHhcNMjYwMjI2MDM0MTU1WhcNMzYwMjI0MDM0MTU1WjA6
MTgwNgYDVQQDDC9hZjE5NmEzNC1jYzM2LTRhNDAtYjRmMy02YzIxNzE3YzlkMTMg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALvwvWGG
ApHmvtYz0HA4+mNiscEJgnabVO565Txsrv4qEmAwfYKtHaglHzNvpJx/JtmSSy8/
reaXPjyRaLSaYoI9d5miEgpel6tsK6KjHk+UU/0R0GsPtFmFKOCGLYwdjX5vuExE
ZiQ9Mq4PY9P/HKw0SubQgiQqMhlEVr5IYAVP0ijMA5OuuMNVkQ3FyK1pDuY8NUbm
7B2sOV4xDbn+DiGtSD8S/7zMoxIFFdm15+DSqvMN65nRcy5FI/P5yPpuh+pHB7iO
NgzI6+eIaxJzZD01WO2IwF/qUAzxSBUPWq54rangjZlwHfs37Chl7JhyiNGnayEr
Z3CjHVi9eU6mCrHDLCaErh3Enl0lRtQvSbCmEqPMRicZXPjdwXx1i1z283h6mL4H
FBCU0AVo+jlLnDp7cb0iRfyzM2FNwcwyJR1F2OHgcr2C+hHKZPuXse+CgtByMw3g
9fS2HXbeqfBuK71b7J8LLqPonzoHdHyAY2dhT4JVaKyQsD3jK/hA9rDV1wIDAQAB
o0IwQDAdBgNVHQ4EFgQU7MI88ulZAEAPLsy62WTY/9Uy3LYwEgYDVR0TAQH/BAgw
BgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAHXcL+k7elXH
9R+S2G5N68NME03T8mte30kENgjf4ZOaTjnKHtiSd6wkJPTayb+VRp4tj9E31u8b
mn2awM1CnFgLWl8PmAtESe63S3yiEKgHhj1zznZJs2je18UcGvXDspAjBiS6/SZR
1VPJSCtK6Ao5Jf2q9ouc/NdGtxP7adKyxpjYqvOwnmWpKPzbwyEO7JAzmMTXXNu5
IOdmtZrpq/QWfCSb8N6JsDKS2/nqcWrTJP0eZc8Is7NGQ+sBcJD3/4VB2ktXnihQ
ppBlhxy9cjFh9c6o1q/HcJRyZlAAY3M+OdIspGBPqaZvvczvurq4/Yj3wNLE2Scd
gLsZB82zna7EBt1BdI+ZRxdMLRVY1orVCiNYXKod/c1f2ts7G5WwGQs2t20JM1Co
OxCrVaGmnXjulDKqPloKcBo0W/t56n3fwuvn523CCZKi23B3hPC7erfg4l1XdGCq
qdDLzZdV3XpvWRwh4pIDpD6X0vKjY3jhCtv6XIc0LQQspgKzM+RYcg==
-----END CERTIFICATE-----`;

let sslConfig;
if (process.env.DB_SSL === "true") {
  // Try to read from file first (for local dev), fallback to embedded cert (for Vercel)
  let caCert;
  try {
    caCert = fs.readFileSync(path.join(__dirname, "..", "ca.pem"));
  } catch (e) {
    caCert = Buffer.from(AIVEN_CA_CERT);
  }
  sslConfig = {
    ca: caCert,
    rejectUnauthorized: true
  };
} else {
  sslConfig = undefined;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST?.trim(),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT.trim()) : 3306,
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
  connectTimeout: 30000,
  acquireTimeout: 30000
});

export async function initDb() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(15),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const conn = await pool.getConnection();
  try {
    await conn.query(createTableSql);
  } finally {
    conn.release();
  }
}

export default pool;

