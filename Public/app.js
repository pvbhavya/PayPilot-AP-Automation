
const $ = (id) => document.getElementById(id);

let invoices = [];
let currentView = "overview";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function badge(value) {
  const text = String(value || "—");
  const key = text.toUpperCase();

  let className = "";
  if (key === "PAID" || key === "MATCHED" || key === "ALREADY PAID") {
    className = "paid";
  } else if (key === "PAY" || key === "MEDIUM") {
    className = "pay";
  } else if (key === "HOLD" || key === "MISMATCH" || key === "HIGH") {
    className = key === "HIGH" ? "high" : "hold";
  }

  return `<span class="pill ${className}">${escapeHtml(text)}</span>`;
}

function setText(id, value) {
  $(id).textContent = value;
}

function renderMetrics() {
  const total = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.invoice_amount || 0),
    0
  );

  const countDecision = (decision) =>
    invoices.filter((invoice) =>
      String(invoice.decision || "").toUpperCase() === decision
    ).length;

  const paidCount = invoices.filter(
    (invoice) => String(invoice.status || "").toUpperCase() === "PAID"
  ).length;

  const unpaid = invoices
    .filter((invoice) => String(invoice.status || "").toUpperCase() !== "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.invoice_amount || 0), 0);

  setText("totalInvoices", invoices.length);
  setText("totalValue", formatMoney(total));
  setText("paidInvoices", paidCount);
  setText("reviewInvoices", countDecision("PAY") + countDecision("HOLD"));

  setText("alreadyPaidCount", countDecision("ALREADY PAID"));
  setText("payCount", countDecision("PAY"));
  setText("holdCount", countDecision("HOLD"));
  setText("noDecisionCount", invoices.filter((i) => !i.decision).length);

  setText("matchedCount", invoices.filter(
    (i) => String(i.po_match || "").toUpperCase() === "MATCHED"
  ).length);

  setText("mismatchCount", invoices.filter(
    (i) => String(i.po_match || "").toUpperCase() === "MISMATCH"
  ).length);

  setText("highRiskCount", invoices.filter(
    (i) => String(i.risk_level || "").toUpperCase() === "HIGH"
  ).length);

  setText("unpaidValue", formatMoney(unpaid));
}

function getFilteredInvoices() {
  const search = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const decision = $("decisionFilter").value;

  return invoices.filter((invoice) => {
    const searchText = [
      invoice.invoice_id,
      invoice.vendor_name,
      invoice.vendor_id,
      invoice.status,
      invoice.decision,
      invoice.po_match
    ].join(" ").toLowerCase();

    const matchesSearch = searchText.includes(search);
    const matchesStatus =
      !status || String(invoice.status || "").toUpperCase() === status;

    const actualDecision = String(invoice.decision || "").toUpperCase();
    const matchesDecision = !decision ||
      (decision === "NONE" ? !actualDecision : actualDecision === decision);

    const matchesView = currentView !== "decisions" || Boolean(actualDecision);

    return matchesSearch && matchesStatus && matchesDecision && matchesView;
  });
}

function renderTable() {
  const filtered = getFilteredInvoices();

  setText(
    "pageTitle",
    currentView === "decisions" ? "Payment decision register" :
    currentView === "invoices" ? "Invoice register" :
    "Finance overview"
  );

  setText(
    "tableTitle",
    currentView === "decisions" ? "Payment decisions" : "Invoice register"
  );

  setText(
    "tableSubtitle",
    currentView === "decisions"
      ? "Review payment recommendations, matching and risk."
      : "Review vendor invoices and their current payment status."
  );

  $("invoiceRows").innerHTML = filtered.length
    ? filtered.map((invoice) => `
      <tr>
        <td>
          <span class="invoice-primary">${escapeHtml(invoice.invoice_id)}</span>
          <span class="invoice-secondary">${escapeHtml(invoice.vendor_id || "")}</span>
        </td>
        <td>
          <span class="invoice-primary">${escapeHtml(invoice.vendor_name || "Unknown vendor")}</span>
        </td>
        <td class="amount">${formatMoney(invoice.invoice_amount)}</td>
        <td>${badge(invoice.status)}</td>
        <td>${badge(invoice.po_match)}</td>
        <td>${badge(invoice.decision || "Pending")}</td>
        <td>${badge(invoice.risk_level)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty-state">No matching records found.</td></tr>`;

  setText(
    "recordCount",
    `Showing ${filtered.length} of ${invoices.length} invoices`
  );
}

async function loadData() {
  const button = $("refreshBtn");
  button.disabled = true;
  button.textContent = "Refreshing…";
  $("connectionLabel").textContent = "Connecting to database";
  $("notice").hidden = true;

  try {
    const response = await fetch("/api/invoices", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to retrieve invoice records.");
    }

    invoices = data;
    renderMetrics();
    renderTable();

    $("connectionLabel").textContent = "DATABASE CONNECTED";
    setText("lastUpdated", `Updated ${new Date().toLocaleTimeString("en-IN")}`);
  } catch (error) {
    $("notice").textContent =
      `${error.message} Check the server terminal and MySQL configuration.`;
    $("notice").className = "notice error";
    $("notice").hidden = false;
    $("connectionLabel").textContent = "DATABASE CONNECTION ERROR";
    $("invoiceRows").innerHTML =
      `<tr><td colspan="7" class="empty-state">Invoice data is unavailable.</td></tr>`;
    setText("recordCount", "Unable to load records");
  } finally {
    button.disabled = false;
    button.textContent = "Refresh data";
  }
}

$("refreshBtn").addEventListener("click", loadData);

$("searchInput").addEventListener("input", renderTable);
$("statusFilter").addEventListener("change", renderTable);
$("decisionFilter").addEventListener("change", renderTable);

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;

    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    $("overviewSection").hidden = currentView !== "overview";
    $("invoicePanel").scrollIntoView({ behavior: "smooth", block: "start" });

    renderTable();
  });
});

setText(
  "currentDate",
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
);

loadData();
