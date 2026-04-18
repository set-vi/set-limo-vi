document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const submitBtn = document.getElementById("submit-btn");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const confirmEmailInput = document.getElementById("confirm-email");
  const dateInput = document.getElementById("date");
  const serviceTime = document.getElementById("time");
  const pickupInput = document.getElementById("pickup");
  const dropoffInput = document.getElementById("dropoff");
  const airportExtra = document.getElementById("airport-extra");
  const airlineInput = document.getElementById("airline");
  const baggageInput = document.getElementById("baggage");
  const roundTripSelect = document.getElementById("roundtrip");
  const returnFields = document.getElementById("return-fields");
  const returnDateInput = document.getElementById("return-date");
  const returnTime = document.getElementById("return-time");
  const passengerInput = document.getElementById("passengers");
  const passengerWarning = document.getElementById("passenger-warning");

  function getTodayLocalISO() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().split("T")[0];
  }

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 10);

    if (numbers.length > 6) {
      return numbers.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1-$2-$3");
    }

    if (numbers.length > 3) {
      return numbers.replace(/(\d{3})(\d{0,3})/, "$1-$2");
    }

    return numbers;
  }

  function validateEmails() {
    if (!emailInput || !confirmEmailInput) return;

    if (
      confirmEmailInput.value &&
      emailInput.value.trim() !== confirmEmailInput.value.trim()
    ) {
      confirmEmailInput.setCustomValidity("Emails do not match.");
    } else {
      confirmEmailInput.setCustomValidity("");
    }
  }

  function toggleAirportFields() {
    if (!pickupInput || !airportExtra) return;

    const isAirport = pickupInput.value.trim() === "Cyril E. King Airport";
    airportExtra.style.display = isAirport ? "block" : "none";

    if (!isAirport) {
      if (airlineInput) airlineInput.value = "";
      if (baggageInput) baggageInput.value = "";
    }
  }

  function toggleReturnFields() {
    if (!roundTripSelect || !returnFields) return;

    const isRoundTrip = roundTripSelect.value === "yes";
    returnFields.style.display = isRoundTrip ? "block" : "none";

    if (returnDateInput) {
      returnDateInput.required = isRoundTrip;
    }

    if (returnTime) {
      returnTime.required = isRoundTrip;
    }

    if (!isRoundTrip) {
      if (returnDateInput) returnDateInput.value = "";
      if (returnTime) returnTime.value = "";
    }
  }

  function minutesFromTimeValue(value) {
    if (!value || !value.includes(":")) return null;

    let [hours, minutes] = value.split(":").map(Number);

    if (hours === 0 && minutes === 0) {
      hours = 24;
    }

    return hours * 60 + minutes;
  }

  function disablePastTimes(selectEl, selectedDate, minimumMinutes) {
    if (!selectEl) return;

    const today = getTodayLocalISO();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    Array.from(selectEl.options).forEach((option) => {
      if (!option.value) {
        option.disabled = false;
        return;
      }

      const optionMinutes = minutesFromTimeValue(option.value);
      let disable = false;

      if (selectedDate === today) {
        disable = optionMinutes <= currentMinutes + 180;
      }

      if (
        minimumMinutes !== null &&
        minimumMinutes !== undefined &&
        optionMinutes !== null &&
        optionMinutes <= minimumMinutes
      ) {
        disable = true;
      }

      option.disabled = disable;
    });

    if (selectEl.selectedOptions.length) {
      const selected = selectEl.selectedOptions[0];
      if (selected && selected.disabled) {
        selectEl.value = "";
      }
    }
  }

  function refreshTimeRules() {
    const outboundDate = dateInput ? dateInput.value : "";
    const returnDate = returnDateInput ? returnDateInput.value : "";
    const outboundMinutes = serviceTime
      ? minutesFromTimeValue(serviceTime.value)
      : null;

    if (serviceTime && outboundDate) {
      disablePastTimes(serviceTime, outboundDate, null);
    }

    if (returnTime && returnDate) {
      let minimumMinutes = null;

      if (
        outboundDate &&
        returnDate &&
        outboundDate === returnDate &&
        outboundMinutes !== null
      ) {
        minimumMinutes = outboundMinutes;
      }

      disablePastTimes(returnTime, returnDate, minimumMinutes);
    }
  }

  function togglePassengerWarning() {
    if (!passengerInput || !passengerWarning) return;

    passengerWarning.style.display =
      Number(passengerInput.value || 0) > 6 ? "block" : "none";
  }

  const today = getTodayLocalISO();

  if (dateInput) {
    dateInput.min = today;
  }

  if (returnDateInput) {
    returnDateInput.min = today;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", validateEmails);
  }

  if (confirmEmailInput) {
    confirmEmailInput.addEventListener("input", validateEmails);
  }

  if (pickupInput) {
    pickupInput.addEventListener("change", toggleAirportFields);
  }

  if (dropoffInput) {
    dropoffInput.addEventListener("change", function () {});
  }

  if (roundTripSelect) {
    roundTripSelect.addEventListener("change", toggleReturnFields);
  }

  if (dateInput) {
    dateInput.addEventListener("change", function () {
      if (returnDateInput && dateInput.value) {
        returnDateInput.min = dateInput.value;

        if (returnDateInput.value && returnDateInput.value < dateInput.value) {
          returnDateInput.value = "";
        }
      }

      refreshTimeRules();
    });
  }

  if (returnDateInput) {
    returnDateInput.addEventListener("change", refreshTimeRules);
  }

  if (serviceTime) {
    serviceTime.addEventListener("change", refreshTimeRules);
  }

  if (passengerInput) {
    passengerInput.addEventListener("input", togglePassengerWarning);
  }

  if (form) {
    form.addEventListener("submit", function () {
      validateEmails();

      if (!form.checkValidity()) {
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }
    });
  }

  toggleAirportFields();
  toggleReturnFields();
  togglePassengerWarning();
  refreshTimeRules();
});