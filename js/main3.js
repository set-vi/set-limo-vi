document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById("booking-form");
  if (!bookingForm) return;

  const bookingDate = document.getElementById("booking-date");
  const pickup = document.getElementById("pickup");
  const pickupOtherDiv = document.getElementById("pickup-other");
  const pickupOtherInput = document.getElementById("pickup-other-text");
  const dropoff = document.getElementById("dropoff");
  const dropoffOtherDiv = document.getElementById("dropoff-other");
  const dropoffOtherInput = document.getElementById("dropoff-other-text");
  const flightInfo = document.getElementById("flight-info");
  const luggageInfo = document.getElementById("luggage-info");
  const roundTrip = document.getElementById("round-trip");
  const returnTripSection = document.getElementById("return-trip-section");
  const numPassengers = document.getElementById("number-of-passengers");
  const serviceType = document.getElementById("service-type");
  const hoursRequested = document.getElementById("hours-requested");
  const childSeat = document.getElementById("child-seat");
  const submitButton =
    document.getElementById("submit-button") ||
    bookingForm.querySelector('button[type="submit"]') ||
    bookingForm.querySelector('input[type="submit"]');

  const breakdownBase = document.getElementById("breakdown-base");
  const breakdownExtraPassengers = document.getElementById("breakdown-extra-passengers");
  const breakdownServiceMultiplier = document.getElementById("breakdown-service-multiplier");
  const breakdownRoundTripMultiplier = document.getElementById("breakdown-round-trip-multiplier");
  const breakdownChildSeat = document.getElementById("breakdown-child-seat");
  const totalPrice = document.getElementById("total-price");

  const baseRate = 180;
  const extraPassengerRate = 25;
  const childSeatRate = 30;

  if (bookingDate) {
    const today = new Date().toISOString().split("T")[0];
    bookingDate.setAttribute("min", today);
  }

  function setDisplay(element, show) {
    if (!element) return;
    element.style.display = show ? "block" : "none";
  }

  function setText(element, value) {
    if (!element) return;
    element.textContent = String(value);
  }

  function calculatePrice() {
    if (!numPassengers || !serviceType || !roundTrip || !childSeat) return;

    const numPersons = parseInt(numPassengers.value, 10) || 1;
    const selectedService = serviceType.value;
    const isRoundTrip = roundTrip.checked;
    const needsChildSeat = childSeat.checked;

    const extraPassengerCost =
      numPersons > 4 ? (numPersons - 4) * extraPassengerRate : 0;

    const serviceMultiplier =
      selectedService === "hourly-rental"
        ? 2
        : selectedService === "daily-rental"
        ? 4
        : 1;

    const roundTripMultiplier = isRoundTrip ? 2 : 1;
    const childSeatCost = needsChildSeat ? childSeatRate : 0;

    const totalCost =
      (baseRate + extraPassengerCost + childSeatCost) *
      serviceMultiplier *
      roundTripMultiplier;

    setText(breakdownBase, baseRate);
    setText(breakdownExtraPassengers, extraPassengerCost);
    setText(breakdownChildSeat, childSeatCost);
    setText(breakdownServiceMultiplier, serviceMultiplier);
    setText(breakdownRoundTripMultiplier, roundTripMultiplier);
    setText(totalPrice, totalCost);
  }

  function updateHoursRequested() {
    if (!serviceType || !hoursRequested) return;

    if (serviceType.value === "transfer") {
      hoursRequested.value = 2;
      hoursRequested.disabled = true;
    } else {
      hoursRequested.disabled = false;
    }
  }

  function updatePickupFields() {
    if (!pickup) return;

    const isAirport = pickup.value === "cyril e. king airport";
    setDisplay(flightInfo, isAirport);
    setDisplay(luggageInfo, isAirport);

    const isOther = pickup.value === "other";
    setDisplay(pickupOtherDiv, isOther);

    if (!isOther && pickupOtherInput) {
      pickupOtherInput.value = "";
    }
  }

  function updateDropoffFields() {
    if (!dropoff) return;

    const isOther = dropoff.value === "other";
    setDisplay(dropoffOtherDiv, isOther);

    if (!isOther && dropoffOtherInput) {
      dropoffOtherInput.value = "";
    }
  }

  function updateReturnTripSection() {
    if (!roundTrip || !returnTripSection) return;
    setDisplay(returnTripSection, roundTrip.checked);
  }

  function validateForm() {
    if (!submitButton) return;
    submitButton.disabled = !bookingForm.checkValidity();
  }

  if (numPassengers) {
    numPassengers.addEventListener("input", function () {
      calculatePrice();
      validateForm();
    });
  }

  if (serviceType) {
    serviceType.addEventListener("change", function () {
      calculatePrice();
      updateHoursRequested();
      validateForm();
    });
  }

  if (roundTrip) {
    roundTrip.addEventListener("change", function () {
      calculatePrice();
      updateReturnTripSection();
      validateForm();
    });
  }

  if (childSeat) {
    childSeat.addEventListener("change", function () {
      calculatePrice();
      validateForm();
    });
  }

  if (pickup) {
    pickup.addEventListener("change", function () {
      updatePickupFields();
      validateForm();
    });
  }

  if (dropoff) {
    dropoff.addEventListener("change", function () {
      updateDropoffFields();
      validateForm();
    });
  }

  bookingForm.addEventListener("input", validateForm);
  bookingForm.addEventListener("change", validateForm);

  bookingForm.addEventListener("submit", function () {
    if (!submitButton) return;

    submitButton.disabled = true;

    if (submitButton.tagName === "INPUT") {
      submitButton.value = "Submitting...";
    } else {
      submitButton.textContent = "Submitting...";
    }
  });

  updateHoursRequested();
  updatePickupFields();
  updateDropoffFields();
  updateReturnTripSection();
  calculatePrice();
  validateForm();
});

