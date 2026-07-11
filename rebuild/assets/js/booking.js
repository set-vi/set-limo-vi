(function () {
  "use strict";

  const CONFIG = Object.freeze({
    baseTransferRate: 180,
    stJohnAdjustment: 520,
    includedPassengers: 4,
    maximumPassengers: 6,
    standardExtraPassengerRate: 25,
    stJohnExtraPassengerRate: 100,
    hourlyRate: 125,
    minimumHourlyHours: 3,
    airportValue: "cyril-e-king-airport",
    stJohnValue: "st-john",
    customLocationValues: new Set(["hotel-resort-not-listed", "villa-private-residence", "other"]),
    emailJsPublicKey: "NOK9sJ5BhK_ywij8U",
    emailJsServiceId: "service_dmvxcdi",
    emailJsAdminTemplateId: "template_ysacch6",
    emailJsCustomerTemplateId: "template_o15zm0b"
  });

  const PAYMENT_TERMS = "Payment is required to confirm service. Deposits, booking fees, and reservation payments are non-refundable once service is confirmed, unless Superb Executive Transportation cancels the service or agrees otherwise in writing. Customer cancellations, no-shows, and customer-requested date, time, route, or service changes do not create a refund or credit unless Superb Executive Transportation agrees otherwise in writing. Changes are subject to availability and may affect the final rate. Flight delays and travel delays are handled based on driver and vehicle availability. Additional wait time, delayed pickup, route changes, or rescheduling may affect the final rate.";

  function requiredElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error("Missing required booking element: " + id);
    return element;
  }

  function localDateValue(date) {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().split("T")[0];
  }

  function formatDate(value) {
    if (!value) return "—";
    const parts = value.split("-");
    return parts.length === 3 ? parts[1] + "/" + parts[2] + "/" + parts[0] : value;
  }

  function formatTime(value) {
    if (!value) return "—";
    const parts = value.split(":");
    if (parts.length !== 2) return value;
    let hour = Number.parseInt(parts[0], 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return hour + ":" + parts[1] + " " + suffix;
  }

  function formatPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) return digits;
    return "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
  }

  function selectText(select) {
    if (!select.value || select.selectedIndex < 0) return "";
    return select.options[select.selectedIndex].text.trim();
  }

  function isStJohnRoute(pickup, dropoff) {
    return pickup === CONFIG.stJohnValue || dropoff === CONFIG.stJohnValue;
  }

  function calculateTransferEstimate(options) {
    const requestedPassengers = Number.parseInt(options.passengers, 10) || 1;
    const passengers = Math.min(Math.max(requestedPassengers, 1), CONFIG.maximumPassengers);
    const stJohn = Boolean(options.stJohn);
    const roundTrip = Boolean(options.roundTrip);
    const extraRate = stJohn ? CONFIG.stJohnExtraPassengerRate : CONFIG.standardExtraPassengerRate;
    const extraPassengers = Math.max(passengers - CONFIG.includedPassengers, 0);
    const passengerAdjustment = extraPassengers * extraRate;
    const stJohnAdjustment = stJohn ? CONFIG.stJohnAdjustment : 0;
    const oneWayTotal = CONFIG.baseTransferRate + stJohnAdjustment + passengerAdjustment;
    const multiplier = roundTrip ? 2 : 1;

    return {
      baseRate: CONFIG.baseTransferRate,
      stJohnAdjustment,
      passengerAdjustment,
      multiplier,
      total: oneWayTotal * multiplier
    };
  }

  function addEstimateRow(container, label, value, total) {
    const row = document.createElement("div");
    row.className = "estimate-row" + (total ? " total" : "");
    const labelElement = document.createElement("span");
    const valueElement = document.createElement("span");
    labelElement.textContent = label;
    valueElement.textContent = value;
    row.append(labelElement, valueElement);
    container.appendChild(row);
  }

  function populateTimeOptions(select) {
    const previousValue = select.value;
    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a time";
    select.appendChild(placeholder);

    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        const value = String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
        const option = document.createElement("option");
        option.value = value;
        option.textContent = formatTime(value);
        select.appendChild(option);
      }
    }

    if (previousValue) select.value = previousValue;
  }

  function populateHourOptions(select, minimum, maximum) {
    const previousValue = Number.parseInt(select.value, 10);
    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select hours";
    select.appendChild(placeholder);

    for (let hour = minimum; hour <= maximum; hour += 1) {
      const option = document.createElement("option");
      option.value = String(hour);
      option.textContent = hour + (hour === 1 ? " hour" : " hours");
      select.appendChild(option);
    }

    select.value = previousValue >= minimum && previousValue <= maximum ? String(previousValue) : String(minimum);
  }

  function runSelfTests() {
    const standard = calculateTransferEstimate({ passengers: 1, stJohn: false, roundTrip: false });
    console.assert(standard.total === 180, "Standard one-way transfer should total 180");

    const stJohn = calculateTransferEstimate({ passengers: 1, stJohn: true, roundTrip: false });
    console.assert(stJohn.total === 700, "St. John one-way transfer should total 700");

    const sixPassengers = calculateTransferEstimate({ passengers: 6, stJohn: false, roundTrip: false });
    console.assert(sixPassengers.passengerAdjustment === 50, "Six-passenger transfer should add 50");

    const roundTrip = calculateTransferEstimate({ passengers: 1, stJohn: false, roundTrip: true });
    console.assert(roundTrip.total === 360, "Standard round trip should total 360");
  }

  function initializeBooking() {
    const form = requiredElement("booking-form");
    const bookingDate = requiredElement("booking-date");
    const bookingTime = requiredElement("booking-time");
    const serviceType = requiredElement("service-type");
    const hoursField = requiredElement("hours-field");
    const hoursRequested = requiredElement("hours-requested");
    const pickup = requiredElement("pickup");
    const dropoff = requiredElement("dropoff");
    const pickupDetailsField = requiredElement("pickup-details-field");
    const pickupDetails = requiredElement("pickup-details");
    const dropoffDetailsField = requiredElement("dropoff-details-field");
    const dropoffDetails = requiredElement("dropoff-details");
    const roundTrip = requiredElement("round-trip");
    const extraStop = requiredElement("extra-stop");
    const returnDateField = requiredElement("return-date-field");
    const returnDate = requiredElement("return-date");
    const returnTimeField = requiredElement("return-time-field");
    const returnTime = requiredElement("return-time");
    const stopDetailsField = requiredElement("stop-details-field");
    const stopDetails = requiredElement("stop-details");
    const flightNumberField = requiredElement("flight-number-field");
    const flightNumber = requiredElement("flight-number");
    const luggageField = requiredElement("luggage-field");
    const luggagePieces = requiredElement("luggage-pieces");
    const routeMessage = requiredElement("route-message");
    const fullName = requiredElement("full-name");
    const phone = requiredElement("phone");
    const email = requiredElement("email");
    const passengers = requiredElement("passengers");
    const rideDetails = requiredElement("ride-details");
    const honeypot = requiredElement("company-website");
    const estimatePanel = requiredElement("estimate-panel");
    const estimateRows = requiredElement("estimate-rows");
    const estimateNote = requiredElement("estimate-note");
    const formStatus = requiredElement("form-status");
    const submitButton = requiredElement("submit-button");

    if (window.emailjs) window.emailjs.init(CONFIG.emailJsPublicKey);

    function showStatus(message, type) {
      formStatus.textContent = message;
      formStatus.className = "form-message" + (type ? " " + type : "");
      formStatus.hidden = false;
      formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function clearStatus() {
      formStatus.textContent = "";
      formStatus.className = "form-message";
      formStatus.hidden = true;
    }

    function setVisible(field, visible, input) {
      field.hidden = !visible;
      if (input) {
        input.required = visible;
        if (!visible) input.value = "";
      }
    }

    function refreshServiceHours() {
      const timedService = ["private-chauffeur", "event", "hourly-rental", "daily-rental"].includes(serviceType.value);
      hoursField.hidden = !timedService;
      hoursRequested.required = timedService;

      if (!timedService) {
        hoursRequested.value = "";
        return;
      }

      if (serviceType.value === "daily-rental") {
        populateHourOptions(hoursRequested, 5, 8);
      } else {
        populateHourOptions(hoursRequested, 3, 6);
      }
    }

    function refreshRouteFields() {
      const customPickup = CONFIG.customLocationValues.has(pickup.value);
      const customDropoff = CONFIG.customLocationValues.has(dropoff.value);
      const airportPickup = pickup.value === CONFIG.airportValue;
      const stJohn = isStJohnRoute(pickup.value, dropoff.value);
      const sameRoute = Boolean(pickup.value && dropoff.value && pickup.value === dropoff.value);

      setVisible(pickupDetailsField, customPickup, pickupDetails);
      setVisible(dropoffDetailsField, customDropoff, dropoffDetails);
      setVisible(flightNumberField, airportPickup, flightNumber);
      luggageField.hidden = !airportPickup;
      if (!airportPickup) luggagePieces.value = "0";

      pickup.setCustomValidity(sameRoute ? "Pickup and drop-off cannot be the same location." : "");
      dropoff.setCustomValidity(sameRoute ? "Pickup and drop-off cannot be the same location." : "");

      if (sameRoute) {
        routeMessage.textContent = "Pickup and drop-off cannot be the same location.";
        routeMessage.className = "form-message error full";
        routeMessage.hidden = false;
      } else if (stJohn) {
        routeMessage.textContent = "St. John trips require additional coordination. Superb will review the route before confirmation.";
        routeMessage.className = "form-message full";
        routeMessage.hidden = false;
      } else {
        routeMessage.hidden = true;
        routeMessage.textContent = "";
      }
    }

    function refreshOptionalTripFields() {
      setVisible(returnDateField, roundTrip.checked, returnDate);
      setVisible(returnTimeField, roundTrip.checked, returnTime);
      setVisible(stopDetailsField, extraStop.checked, stopDetails);
      returnDate.min = bookingDate.value || bookingDate.min;
    }

    function refreshEstimate() {
      estimateRows.replaceChildren();

      if (!serviceType.value) {
        estimatePanel.hidden = true;
        return;
      }

      const stJohn = isStJohnRoute(pickup.value, dropoff.value);
      const passengerCount = Number.parseInt(passengers.value, 10) || 1;
      estimatePanel.hidden = false;

      if (serviceType.value === "transfer") {
        const result = calculateTransferEstimate({
          passengers: passengerCount,
          stJohn,
          roundTrip: roundTrip.checked
        });
        addEstimateRow(estimateRows, "Base transfer rate", "$" + result.baseRate, false);
        if (result.stJohnAdjustment) addEstimateRow(estimateRows, "St. John coordination", "$" + result.stJohnAdjustment, false);
        if (result.passengerAdjustment) addEstimateRow(estimateRows, "Capacity adjustment", "$" + result.passengerAdjustment, false);
        if (result.multiplier > 1) addEstimateRow(estimateRows, "Round trip", "×" + result.multiplier, false);
        addEstimateRow(estimateRows, "Estimated total", "$" + result.total, true);
        estimateNote.textContent = "This is an estimate. Extra stops, wait time, changes, and special itinerary needs may affect the final confirmed rate.";
        return;
      }

      if (["private-chauffeur", "event", "hourly-rental"].includes(serviceType.value)) {
        const hours = Number.parseInt(hoursRequested.value, 10) || CONFIG.minimumHourlyHours;
        const total = hours * CONFIG.hourlyRate;
        addEstimateRow(estimateRows, "Selected reserved time", hours + " hours", false);
        addEstimateRow(estimateRows, "Hourly rate", "$" + CONFIG.hourlyRate + "/hr", false);
        addEstimateRow(estimateRows, "Starting estimate", "$" + total, true);
        estimateNote.textContent = stJohn
          ? "St. John service and itinerary details require additional coordination before the final rate is confirmed."
          : "The final rate is reviewed against the requested itinerary, wait time, extra stops, and availability.";
        return;
      }

      addEstimateRow(estimateRows, "Daily service", "Manual review", true);
      estimateNote.textContent = "Daily service is priced after the requested hours, itinerary, route, and vehicle availability are reviewed.";
    }

    function refreshAll() {
      refreshServiceHours();
      refreshRouteFields();
      refreshOptionalTripFields();
      refreshEstimate();
    }

    function validateTripTimes() {
      if (!bookingDate.value || !bookingTime.value) return false;
      const departure = new Date(bookingDate.value + "T" + bookingTime.value);
      if (departure <= new Date()) {
        showStatus("Choose a service date and time in the future.", "error");
        bookingDate.focus();
        return false;
      }

      if (roundTrip.checked) {
        const returning = new Date(returnDate.value + "T" + returnTime.value);
        if (returning <= departure) {
          showStatus("The return trip must occur after the initial service time.", "error");
          returnDate.focus();
          return false;
        }
      }

      return true;
    }

    function pricingText() {
      if (serviceType.value === "transfer") {
        const result = calculateTransferEstimate({
          passengers: passengers.value,
          stJohn: isStJohnRoute(pickup.value, dropoff.value),
          roundTrip: roundTrip.checked
        });
        return "Estimated request total: $" + result.total + ". Final rate is confirmed before service.";
      }

      if (["private-chauffeur", "event", "hourly-rental"].includes(serviceType.value)) {
        const hours = Number.parseInt(hoursRequested.value, 10) || CONFIG.minimumHourlyHours;
        return "Selected estimate: $" + hours * CONFIG.hourlyRate + " for " + hours + " hours at $" + CONFIG.hourlyRate + "/hr. Final rate is confirmed before service.";
      }

      return "Daily service requires manual itinerary and availability review.";
    }

    function buildTemplateParams() {
      const pickupLabel = selectText(pickup);
      const dropoffLabel = selectText(dropoff);
      const pickupDescription = pickupDetails.value.trim() ? pickupLabel + " — " + pickupDetails.value.trim() : pickupLabel;
      const dropoffDescription = dropoffDetails.value.trim() ? dropoffLabel + " — " + dropoffDetails.value.trim() : dropoffLabel;
      const stJohn = isStJohnRoute(pickup.value, dropoff.value);

      return {
        name: fullName.value.trim(),
        email: email.value.trim(),
        phone: formatPhone(phone.value),
        date: formatDate(bookingDate.value),
        time: formatTime(bookingTime.value),
        pickup: pickupDescription,
        dropoff: dropoffDescription,
        route: pickupDescription + " → " + dropoffDescription,
        passengers: passengers.value,
        roundtrip: roundTrip.checked ? "Yes" : "No",
        return_date: roundTrip.checked ? formatDate(returnDate.value) : "Not applicable.",
        return_time: roundTrip.checked ? formatTime(returnTime.value) : "Not applicable.",
        return_pickup: roundTrip.checked ? dropoffDescription : "Not applicable.",
        return_dropoff: roundTrip.checked ? pickupDescription : "Not applicable.",
        flight_number: flightNumber.value.trim() || "Not provided.",
        details: rideDetails.value.trim() || "None provided.",
        extra_stop: extraStop.checked ? "Yes" : "No",
        stop_details: extraStop.checked ? stopDetails.value.trim() : "Not applicable.",
        luggage_pieces: luggagePieces.value || "0",
        service_type: selectText(serviceType),
        hours_requested: hoursRequested.value ? hoursRequested.value + " hours" : "Not applicable.",
        policy_agreed: "Customer acknowledged that the request requires final confirmation.",
        payment_terms: PAYMENT_TERMS,
        request_notice: "Request received. Please check your email for confirmation details.",
        coordination_notice: stJohn ? "St. John service requires additional coordination." : "Superb will review availability and final details.",
        manual_confirmation_required: "Yes",
        to_email: email.value.trim(),
        customer_email: email.value.trim(),
        reply_to: email.value.trim(),
        from_name: fullName.value.trim(),
        from_email: email.value.trim(),
        user_name: fullName.value.trim(),
        user_email: email.value.trim(),
        subject: "New S.E.T. Service Request",
        pricing: pricingText()
      };
    }

    async function sendRequest(params) {
      if (!window.emailjs) throw new Error("Email service is unavailable.");
      await window.emailjs.send(CONFIG.emailJsServiceId, CONFIG.emailJsAdminTemplateId, params);

      if (!CONFIG.emailJsCustomerTemplateId) return { customerEmailSent: false };

      try {
        await new Promise(function (resolve) {
          window.setTimeout(resolve, 900);
        });
        await window.emailjs.send(CONFIG.emailJsServiceId, CONFIG.emailJsCustomerTemplateId, params);
        return { customerEmailSent: true };
      } catch (error) {
        console.warn("Customer confirmation email failed after the business request was sent.", error);
        return { customerEmailSent: false };
      }
    }

    function setSubmitting(submitting) {
      submitButton.disabled = submitting;
      submitButton.textContent = submitting ? "Sending Request…" : "Submit Request";
    }

    bookingDate.min = localDateValue(new Date());
    returnDate.min = bookingDate.min;
    populateTimeOptions(bookingTime);
    populateTimeOptions(returnTime);

    phone.addEventListener("input", function () {
      phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
      phone.setCustomValidity(phone.value.length === 10 ? "" : "Enter a 10-digit phone number.");
    });

    bookingDate.addEventListener("change", function () {
      returnDate.min = bookingDate.value || bookingDate.min;
      if (returnDate.value && returnDate.value < returnDate.min) returnDate.value = returnDate.min;
      refreshAll();
    });

    [serviceType, hoursRequested, pickup, dropoff, passengers].forEach(function (element) {
      element.addEventListener("change", refreshAll);
    });
    passengers.addEventListener("input", refreshEstimate);
    roundTrip.addEventListener("change", refreshAll);
    extraStop.addEventListener("change", refreshAll);

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearStatus();

      if (honeypot.value) {
        showStatus("Request received.", "success");
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        showStatus("Review the highlighted reservation fields and complete the required information.", "error");
        return;
      }

      if (!validateTripTimes()) return;

      const lastSuccessfulSubmission = Number.parseInt(window.localStorage.getItem("setLastBookingSubmitAt") || "0", 10);
      if (Date.now() - lastSuccessfulSubmission < 30000) {
        showStatus("A request was just submitted from this browser. Wait briefly before sending another request.", "error");
        return;
      }

      setSubmitting(true);
      showStatus("Sending the reservation request…", "");

      try {
        const templateParams = buildTemplateParams();
        const sendResult = await sendRequest(templateParams);
        window.localStorage.setItem("setLastBookingSubmitAt", String(Date.now()));
        window.sessionStorage.setItem(
          "setBookingSummary",
          JSON.stringify({
            name: fullName.value.trim(),
            date: formatDate(bookingDate.value),
            time: formatTime(bookingTime.value),
            route: templateParams.route,
            customerEmailSent: sendResult.customerEmailSent
          })
        );
        window.location.assign("thank-you.html");
      } catch (error) {
        console.error("Reservation submission failed.", error);
        showStatus("The website could not send the request. Contact Superb directly at 340-642-8686 or setlimovi@gmail.com.", "error");
      } finally {
        setSubmitting(false);
      }
    });

    runSelfTests();
    refreshAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeBooking, { once: true });
  } else {
    initializeBooking();
  }
})();
