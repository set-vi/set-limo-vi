(function () {
  "use strict";

  const summaryElement = document.querySelector("[data-booking-summary]");
  const noteElement = document.querySelector("[data-confirmation-note]");

  if (!summaryElement) return;

  let summary = null;
  try {
    summary = JSON.parse(window.sessionStorage.getItem("setBookingSummary") || "null");
  } catch (error) {
    console.warn("Booking summary could not be read.", error);
  }

  if (!summary) {
    summaryElement.hidden = true;
    return;
  }

  const fields = [
    ["Name", summary.name],
    ["Service date", summary.date],
    ["Service time", summary.time],
    ["Route", summary.route]
  ];

  fields.forEach(function (entry) {
    const row = document.createElement("div");
    row.className = "estimate-row";
    const label = document.createElement("span");
    const value = document.createElement("span");
    label.textContent = entry[0];
    value.textContent = entry[1] || "—";
    row.append(label, value);
    summaryElement.appendChild(row);
  });

  if (noteElement && summary.customerEmailSent === false) {
    noteElement.textContent = "Your request reached Superb, but the customer confirmation email may not have been delivered. Superb will review the request and contact you directly.";
  }

  window.sessionStorage.removeItem("setBookingSummary");
})();
