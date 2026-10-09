# PayPilot — Accounts Payable Automation

**An intelligent accounts payable control center for invoice processing, purchase order matching, and payment decision support.**

PayPilot is a finance operations project designed to streamline accounts payable workflows by combining UiPath robotic process automation, Node.js, Express, and MySQL with a clean web-based dashboard.

## Overview

Accounts payable teams process invoices from multiple vendors, verify purchase orders, track payment status, and identify discrepancies before approving payments. PayPilot brings these activities into one dashboard to improve visibility and support consistent payment decisions.

## Key Features

- **Invoice Register:** View invoice IDs, vendors, amounts, dates, and payment statuses.
- **Purchase Order Matching:** Identify invoices that match or mismatch their associated purchase orders.
- **Payment Decision Support:** Classify invoices as `PAY`, `HOLD`, or `ALREADY PAID`.
- **Risk Indicators:** Highlight high-risk invoices that require further review.
- **Finance Dashboard:** Summarize invoice value, paid invoices, payment recommendations, and mismatches.
- **Database Integration:** Retrieve and manage accounts payable records using MySQL.
- **Automation Foundation:** Use UiPath to support invoice processing and repetitive finance operations.

## Technology Stack

| Technology | Purpose |
|---|---|
| UiPath | Robotic process automation |
| Node.js | Server-side JavaScript runtime |
| Express.js | Backend API and web server |
| MySQL | Relational database |
| HTML5 | Dashboard structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend interactions |

## System Architecture

```text
Invoice PDFs
     |
     v
UiPath Automation
     |
     v
MySQL Database
     ^
     |
Node.js + Express API
     ^
     |
Web Dashboard
     |
     v
Invoice Monitoring and Payment Decisions
```

## Project Structure

```text
PayPilot/
├── Public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- MySQL Server
- Git
- A configured MySQL database containing the required PayPilot tables

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/pvbhavya/PayPilot-AP-Automation.git
   ```

2. Enter the project directory:

   ```bash
   cd PayPilot-AP-Automation
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure the MySQL connection using environment variables or the project's existing configuration method. Never commit real passwords or API keys.

5. Ensure the required database and tables exist.

6. Start the application using the start script configured in `package.json`:

   ```bash
   npm start
   ```

7. Open the local address shown in the terminal. If the application uses port 3000, visit:

   `http://localhost:3000`

## Payment Decision Logic

PayPilot uses invoice and purchase order information to support payment review:

- **ALREADY PAID:** A payment record indicates that the invoice has already been paid.
- **PAY:** The invoice passes the configured purchase order checks and is recommended for payment.
- **HOLD:** A discrepancy requires review before payment.

These are decision-support classifications. A `PAY` recommendation does not by itself mean a payment has been executed.

## Security

- Keep `.env` files and credentials out of version control.
- Use `.gitignore` to exclude local dependencies and secret configuration.
- Use appropriate database permissions.
- Validate invoice data and database inputs.
- Review mismatches before making payment decisions.

## Future Enhancements

- AI-assisted invoice field extraction
- Support for additional invoice layouts
- Automated anomaly and duplicate invoice detection
- UiPath Orchestrator integration
- Audit trails and approval workflows
- Enhanced reporting and analytics

## Project Information

**Project:** PayPilot — Accounts Payable Automation  
**Domain:** Finance and Accounting  
**Repository:** [PayPilot-AP-Automation](https://github.com/pvbhavya/PayPilot-AP-Automation)

---

*PayPilot aims to make accounts payable processing more organized, transparent, and efficient through automation and data-driven decision support.*
