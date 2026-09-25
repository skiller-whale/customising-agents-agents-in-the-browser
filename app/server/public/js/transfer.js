// app/client/transfer.ts
var form = document.querySelector("#transfer-form");
var status = document.querySelector("#transfer-status");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const response = await fetch("/api/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromAccountId: data.get("fromAccountId"),
      destination: data.get("toAccountId"),
      amount: data.get("amount"),
      reference: data.get("reference")
    })
  });
  const body = await response.json();
  if (!status) return;
  if (response.ok) {
    status.className = "status success";
    status.textContent = "Transfer sent. Refresh the dashboard to see the new balances.";
  } else {
    status.className = "status error";
    status.textContent = `Transfer failed: ${body.error}`;
  }
});
