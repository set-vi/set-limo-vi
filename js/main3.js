document.addEventListener("DOMContentLoaded", function () {
  // Set minimum booking date to today
  const bookingDate = document.getElementById("booking-date");
  const today = new Date().toISOString().split('T')[0];
  bookingDate.setAttribute("min", today);

  // Elements for dynamic form behavior
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
  const childSeat = document.getElementById("child-seat"); // Cached element

  // Price breakdown elements
  const breakdownBase = document.getElementById("breakdown-base");
  const breakdownExtraPassengers = document.getElementById("breakdown-extra-passengers");
  const breakdownServiceMultiplier = document.getElementById("breakdown-service-multiplier");
  const breakdownRoundTripMultiplier = document.getElementById("breakdown-round-trip-multiplier");
  const breakdownChildSeat = document.getElementById("breakdown-child-seat");
  const totalPrice = document.getElementById("total-price");

  const baseRate = 180;
  const extraPassengerRate = 25;
  const childSeatRate = 30;

  function calculatePrice() {
    let numPersons = parseInt(numPassengers.value) || 1;
    let selectedService = serviceType.value;
    let isRoundTrip = roundTrip.checked;
    let needsChildSeat = childSeat.checked;

    let extraPassengerCost = numPersons > 4 ? (numPersons - 4) * extraPassengerRate : 0;
    let serviceMultiplier = selectedService === "hourly-rental" ? 2 : selectedService === "daily-rental" ? 4 : 1;
    let roundTripMultiplier = isRoundTrip ? 2 : 1;
    let childSeatCost = needsChildSeat ? childSeatRate : 0;

    let totalCost = (baseRate + extraPassengerCost + childSeatCost) * serviceMultiplier * roundTripMultiplier;

    breakdownBase.textContent = baseRate;
    breakdownExtraPassengers.textContent = extraPassengerCost;
    breakdownChildSeat.textContent = childSeatCost;
    breakdownServiceMultiplier.textContent = serviceMultiplier;
    breakdownRoundTripMultiplier.textContent = roundTripMultiplier;
    totalPrice.textContent = totalCost;
  }

  calculatePrice();

  // Update price and validate form on relevant changes
  numPassengers.addEventListener("input", () => { calculatePrice(); validateForm(); });
  serviceType.addEventListener("change", () => { calculatePrice(); updateHoursRequested(); validateForm(); });
  roundTrip.addEventListener("change", () => {
    calculatePrice();
    returnTripSection.style.display = roundTrip.checked ? "block" : "none";
  });
  childSeat.addEventListener("change", () => { calculatePrice(); });

  // Show/hide fields for pickup and dropoff
  pickup.addEventListener("change", function () {
    const isAirport = pickup.value === "cyril e. king airport";
    flightInfo.style.display = isAirport ? "block" : "none";
    luggageInfo.style.display = isAirport ? "block" : "none";
    pickupOtherDiv.style.display = pickup.value === "other" ? "block" : "none";
    if (pickup.value !== "other") pickupOtherInput.value = "";
  });

  dropoff.addEventListener("change", function () {
    if (dropoff.value === "other") {
      dropoffOtherDiv.style.display = "block";
    } else {
      dropoffOtherDiv.style.display = "none";
      dropoffOtherInput.value = "";
    }
  });

  function updateHoursRequested() {
    if (serviceType.value === "transfer") {
      hoursRequested.value = 2;
      hoursRequested.disabled = true;
    } else {
      hoursRequested.disabled = false;
    }
  }
  updateHoursRequested();

  // Form validation
  const bookingForm = document.getElementById("booking-form");
  const submitButton = document.getElementById("submit-button");

  function validateForm() {
    submitButton.disabled = !bookingForm.checkValidity();
  }

  bookingForm.addEventListener("input", validateForm);
  bookingForm.addEventListener("change", validateForm);

  // Form submission handling
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Form submitted successfully!");
    // Further processing can be added here.
  });
});
