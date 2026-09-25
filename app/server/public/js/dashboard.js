// app/client/dashboard.ts
var button = document.querySelector("#export-csv");
var status = document.querySelector("#export-status");
button?.addEventListener("click", async () => {
  const response = await fetch("/api/transactions");
  const data = await response.json();
  const rows = data.transactions.map(
    (t) => `${t.date},"${t.counterparty}",${(t.amountMinor / 100).toFixed(2)}`
  );
  const csv = ["date,description,amount", ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "fintech-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
  if (status) status.textContent = `Exported ${rows.length} transactions.`;
});
