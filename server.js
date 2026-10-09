
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "AP_ERP",
  waitForConnections: true,
  connectionLimit: 5,
  decimalNumbers: true
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ server: "online", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      server: "online",
      database: "disconnected"
    });
  }
});

app.get("/api/invoices", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        i.invoice_id,
        i.vendor_id,
        v.vendor_name,
        i.invoice_date,
        i.due_date,
        i.invoice_amount,
        i.status,
        pd.po_match,
        pd.decision,
        pd.risk_level,
        pd.priority,
        pd.decision_reason
      FROM invoices AS i
      LEFT JOIN vendors AS v
        ON v.vendor_id = i.vendor_id
      LEFT JOIN payment_decisions AS pd
        ON pd.invoice_id = i.invoice_id
      ORDER BY i.invoice_date DESC, i.invoice_id ASC
    `);

    res.set("Cache-Control", "no-store");
    res.json(rows);
  } catch (error) {
    console.error("Invoice query failed:", error.message);
    res.status(500).json({
      error: "Could not retrieve invoices. Verify the database tables and column names."
    });
  }
});

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connection established.");

    app.listen(port, () => {
      console.log(`PayPilot running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL:", error.message);
    console.error("Check your .env settings and confirm MySQL is running.");
    process.exitCode = 1;
  }
}

startServer();
