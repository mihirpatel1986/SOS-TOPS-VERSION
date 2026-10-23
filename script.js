/* =========================================
   SAFEGUARD SOS
   VANILLA JAVASCRIPT
========================================= */

"use strict";

/* =========================================
   GLOBAL VARIABLES
========================================= */

let currentLocation = null;
let pendingEmergencyType = "";
let emergencyActive = false;

/* =========================================
   DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadVehicle();
  loadContacts();
  loadEmergencyHistory();
  updateDashboard();

  setupMobileMenu();
});

/* =========================================
   MOBILE MENU
========================================= */

function setupMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll("#navMenu a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
}

/* =========================================
   TOAST NOTIFICATION
========================================= */

function showToast(message, type = "normal") {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.className = "toast show";

  if (type === "error") {
    toast.classList.add("error");
  }

  if (type === "success") {
    toast.classList.add("success");
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* =========================================
   PROFILE
========================================= */

function saveProfile() {
  const name = document.getElementById("userName").value.trim();
  const mobile = document.getElementById("userMobile").value.trim();
  const email = document.getElementById("userEmail").value.trim();

  if (!name || !mobile || !email) {
    showToast("Please enter your name, mobile number and email.", "error");

    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email address.", "error");

    return;
  }

  const profile = {
    name,
    mobile,
    email,
  };

  localStorage.setItem("safeguardProfile", JSON.stringify(profile));

  displayProfile(profile);

  showToast("Profile saved successfully.", "success");
}

function loadProfile() {
  const data = localStorage.getItem("safeguardProfile");

  if (!data) return;

  try {
    const profile = JSON.parse(data);

    const nameInput = document.getElementById("userName");
    const mobileInput = document.getElementById("userMobile");
    const emailInput = document.getElementById("userEmail");

    if (nameInput) nameInput.value = profile.name || "";
    if (mobileInput) mobileInput.value = profile.mobile || "";
    if (emailInput) emailInput.value = profile.email || "";

    displayProfile(profile);
  } catch (error) {
    console.error("Profile loading error:", error);
  }
}

function displayProfile(profile) {
  const display = document.getElementById("profileDisplay");

  if (!display) return;

  display.innerHTML = `
        <strong>${escapeHTML(profile.name)}</strong><br>
        📱 ${escapeHTML(profile.mobile)}<br>
        📧 ${escapeHTML(profile.email)}
    `;
}

/* =========================================
   VEHICLE
========================================= */

function saveVehicle() {
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();

  const vehicleModel = document.getElementById("vehicleModel").value.trim();

  const driverName = document.getElementById("driverName").value.trim();

  if (!vehicleNumber || !vehicleModel || !driverName) {
    showToast("Please complete all vehicle information.", "error");

    return;
  }

  const vehicle = {
    vehicleNumber,
    vehicleModel,
    driverName,
  };

  localStorage.setItem("safeguardVehicle", JSON.stringify(vehicle));

  showToast("Vehicle information saved.", "success");
}

function loadVehicle() {
  const data = localStorage.getItem("safeguardVehicle");

  if (!data) return;

  try {
    const vehicle = JSON.parse(data);
    const vehicleNumber = document.getElementById("vehicleNumber");
    const vehicleModel = document.getElementById("vehicleModel");
    const driverName = document.getElementById("driverName");

    if (vehicleNumber) vehicleNumber.value = vehicle.vehicleNumber || "";
    if (vehicleModel) vehicleModel.value = vehicle.vehicleModel || "";
    if (driverName) driverName.value = vehicle.driverName || "";
  } catch (error) {
    console.error("Vehicle loading error:", error);
  }
}

/* =========================================
   GPS LOCATION
========================================= */

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by this browser.", "error");

    return;
  }

  updateLocationStatus("REQUESTING...");

  showToast("Requesting GPS location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      currentLocation = {
        latitude,
        longitude,
        accuracy,
        demo: false,
      };

      updateLocationUI();

      showToast("Location found successfully.", "success");
    },

    (error) => {
      let message = "Unable to get your location.";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Location permission was denied.";
          break;

        case error.POSITION_UNAVAILABLE:
          message = "Location information is unavailable.";
          break;

        case error.TIMEOUT:
          message = "GPS request timed out.";
          break;
      }

      updateLocationStatus("ERROR");

      showToast(message, "error");
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    },
  );
}

function updateLocationUI() {
  if (!currentLocation) return;

  const lat = currentLocation.latitude.toFixed(6);

  const lng = currentLocation.longitude.toFixed(6);

  const accuracy = Math.round(currentLocation.accuracy);

  const values = {
    latitude: lat,
    longitude: lng,
    accuracy: accuracy + " m",
    mapLat: lat,
    mapLng: lng,
    mapAccuracy: accuracy + " m",
    locationState: "ACTIVE",
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  updateLocationStatus("FOUND ✓");

  const placeholder = document.getElementById("mapPlaceholder");

  if (placeholder) placeholder.innerHTML = `
        <div class="map-pin">📍</div>
        <h3>GPS Location Found</h3>
        <p>
            ${lat}, ${lng}
        </p>
        ${
          currentLocation.demo
            ? "<strong style='color:#ffcc00'>DEMO LOCATION</strong>"
            : "<strong style='color:#43d17d'>REAL GPS LOCATION</strong>"
        }
    `;
}

function updateLocationStatus(status) {
  const badge = document.getElementById("locationBadge");
  if (badge) badge.textContent = status;

  const message = document.getElementById("locationMessage");
  if (message) message.textContent = "Location Status: " + status;
}

function openMap() {
  if (!currentLocation) {
    showToast("Please get your location first.", "error");

    return;
  }

  const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;

  window.open(url, "_blank");
}

/* =========================================
   DEMO LOCATION
========================================= */

function activateDemoLocation() {
  currentLocation = {
    latitude: 23.0225,
    longitude: 72.5714,
    accuracy: 10,
    demo: true,
  };

  updateLocationUI();

  showToast(
    "Demo location activated. This is NOT your real location.",
    "success",
  );
}

/* =========================================
   START SOS
========================================= */

function startSOS(type) {
  pendingEmergencyType = type;

  const modal = document.getElementById("countdownModal");
  const title = document.getElementById("countdownTitle");

  if (title) {
    title.textContent =
      type === "Vehicle Emergency"
        ? "VEHICLE EMERGENCY DETECTED"
        : "SOS ACTIVATING...";
  }

  if (modal) modal.classList.remove("hidden");
}

/* =========================================
   ACTIVATE NOW
========================================= */

function activateNow() {
  activateEmergency();
}

/* =========================================
   CANCEL SOS
========================================= */

function cancelSOS() {
  const modal = document.getElementById("countdownModal");
  if (modal) modal.classList.add("hidden");

  saveEmergencyHistory(pendingEmergencyType, "Cancelled");

  updateDashboard();

  showToast("SOS cancelled.", "success");
}

/* =========================================
   ACTIVATE EMERGENCY
========================================= */

function activateEmergency() {
  const modal = document.getElementById("countdownModal");
  if (modal) modal.classList.add("hidden");

  emergencyActive = true;

  updateEmergencyStatus();

  /*
        First try to get real GPS.
        If permission fails, the user can use Demo Emergency.
    */

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          demo: false,
        };

        updateLocationUI();

        finishEmergencyActivation();
      },

      () => {
        showToast(
          "Real GPS unavailable. The emergency message will not include your location.",
          "error",
        );

        finishEmergencyActivation();
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  } else {
    finishEmergencyActivation();
  }
}

/* =========================================
   FINISH EMERGENCY
========================================= */

function finishEmergencyActivation() {
  const message = generateEmergencyMessage();

  const messageField = document.getElementById("emergencyMessage");
  if (messageField) messageField.value = message;

  const typeLabel = document.getElementById("emergencyType");
  if (typeLabel) typeLabel.textContent = pendingEmergencyType;

  // Keep the current alert available to other pages in this browser.
  localStorage.setItem("safeguardActiveEmergency", JSON.stringify({
    type: pendingEmergencyType,
    activatedAt: new Date().toISOString(),
    location: currentLocation ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      demo: Boolean(currentLocation.demo)
    } : null,
    status: "ACTIVE"
  }));

  const result = document.getElementById("emergencyResult");
  if (result) {
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth" });
  }

  saveEmergencyHistory(pendingEmergencyType, "Activated");

  updateDashboard();

  showToast("SOS is now ACTIVE.", "error");
}

/* =========================================
   EMERGENCY MESSAGE
========================================= */

function generateEmergencyMessage() {
  const profileData = localStorage.getItem("safeguardProfile");

  let name = "Unknown User";

  if (profileData) {
    try {
      const profile = JSON.parse(profileData);

      name = profile.name || name;
    } catch (error) {
      console.error(error);
    }
  }

  const vehicleData = localStorage.getItem("safeguardVehicle");

  let vehicleNumber = "Not applicable";

  if (vehicleData) {
    try {
      const vehicle = JSON.parse(vehicleData);

      vehicleNumber = vehicle.vehicleNumber || vehicleNumber;
    } catch (error) {
      console.error(error);
    }
  }

  const now = new Date().toLocaleString();

  let locationText = "Location unavailable";

  if (currentLocation) {
    locationText = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;

    if (currentLocation.demo) {
      locationText += "\n(DEMO LOCATION - NOT REAL GPS)";
    }
  }

  return `
🚨 EMERGENCY SOS ALERT 🚨

Name: ${name}

Emergency Type: ${pendingEmergencyType}

Vehicle: ${vehicleNumber}

Time: ${now}

Current Location:
${locationText}

Please contact me immediately.

This message was generated by SafeGuard SOS.
`.trim();
}

/* =========================================
   COPY MESSAGE
========================================= */

function copyMessage() {
  const message = document.getElementById("emergencyMessage").value;

  navigator.clipboard
    .writeText(message)
    .then(() => {
      showToast("Emergency message copied.", "success");
    })
    .catch(() => {
      showToast("Could not copy message.", "error");
    });
}

/* =========================================
   WHATSAPP ALERT
========================================= */

function sendWhatsAppAlert() {
  const contacts = getContacts();

  if (contacts.length === 0) {
    showToast("Please add an emergency contact first.", "error");

    return;
  }

  let number = contacts[0].whatsapp || contacts[0].mobile;

  number = number.replace(/\D/g, "");

  if (number.length < 10) {
    showToast("Invalid WhatsApp number.", "error");

    return;
  }

  /*
        India country code is added if required.
    */

  if (number.length === 10) {
    number = "91" + number;
  }

  const message = document.getElementById("emergencyMessage").value;

  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

  showToast("WhatsApp opened with a pre-filled message.", "success");
}

/* =========================================
   EMAIL ALERT
========================================= */

function sendEmailAlert() {
  const contacts = getContacts();

  if (contacts.length === 0) {
    showToast("Please add an emergency contact first.", "error");

    return;
  }

  const email = contacts[0].email;

  if (!email) {
    showToast("The first contact does not have an email.", "error");

    return;
  }

  const message = document.getElementById("emergencyMessage").value;

  const subject = "EMERGENCY SOS ALERT";

  const mailto =
    `mailto:${encodeURIComponent(email)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(message)}`;

  window.location.href = mailto;

  showToast("Opening your email application.", "success");
}

/* =========================================
   CONTACT MANAGEMENT
========================================= */

function getContacts() {
  const data = localStorage.getItem("safeguardContacts");

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(error);

    return [];
  }
}

function saveContact() {
  const name = document.getElementById("contactName").value.trim();

  const relationship = document.getElementById("relationship").value.trim();

  const mobile = document.getElementById("contactMobile").value.trim();

  const email = document.getElementById("contactEmail").value.trim();

  const whatsapp = document.getElementById("whatsappNumber").value.trim();

  if (!name || !relationship || !mobile) {
    showToast("Please fill in name, relationship and mobile.", "error");

    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast("Please enter a valid email.", "error");

    return;
  }

  const contacts = getContacts();

  contacts.push({
    id: Date.now(),
    name,
    relationship,
    mobile,
    email,
    whatsapp,
  });

  localStorage.setItem("safeguardContacts", JSON.stringify(contacts));

  document.getElementById("contactName").value = "";
  document.getElementById("relationship").value = "";
  document.getElementById("contactMobile").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("whatsappNumber").value = "";

  loadContacts();

  updateDashboard();

  showToast("Emergency contact added.", "success");
}

function loadContacts() {
  const contacts = getContacts();

  const container = document.getElementById("contactsList");

  if (!container) return;

  container.innerHTML = "";

  if (contacts.length === 0) {
    container.innerHTML = `
            <div class="card">
                <p style="color:#8294a9">
                    No emergency contacts added yet.
                </p>
            </div>
        `;

    return;
  }

  contacts.forEach((contact) => {
    const item = document.createElement("div");

    item.className = "contact-item";

    item.innerHTML = `
            <div>
                <h3>👤 ${escapeHTML(contact.name)}</h3>
                <p>
                    ${escapeHTML(contact.relationship)}
                    <br>
                    📱 ${escapeHTML(contact.mobile)}
                    ${
                      contact.email ? `<br>📧 ${escapeHTML(contact.email)}` : ""
                    }
                </p>
            </div>

            <button
                class="btn danger-small"
                onclick="deleteContact(${contact.id})">
                DELETE
            </button>
        `;

    container.appendChild(item);
  });
}

function deleteContact(id) {
  const contacts = getContacts();

  const updated = contacts.filter((contact) => contact.id !== id);

  localStorage.setItem("safeguardContacts", JSON.stringify(updated));

  loadContacts();

  updateDashboard();

  showToast("Contact deleted.", "success");
}

/* =========================================
   EMERGENCY HISTORY
========================================= */

function getHistory() {
  const data = localStorage.getItem("safeguardHistory");

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(error);

    return [];
  }
}

function saveEmergencyHistory(type, status) {
  const history = getHistory();

  const now = new Date();

  history.unshift({
    id: Date.now(),

    date: now.toLocaleDateString(),

    time: now.toLocaleTimeString(),

    type,

    latitude: currentLocation ? currentLocation.latitude : null,

    longitude: currentLocation ? currentLocation.longitude : null,

    status,
  });

  localStorage.setItem("safeguardHistory", JSON.stringify(history));

  loadEmergencyHistory();
}

function loadEmergencyHistory() {
  const history = getHistory();

  const table = document.getElementById("historyTable");

  if (!table) return;

  table.innerHTML = "";

  if (history.length === 0) {
    table.innerHTML = `
            <tr>
                <td colspan="5">
                    No emergency events yet.
                </td>
            </tr>
        `;

    return;
  }

  history.forEach((event) => {
    const row = document.createElement("tr");

    const location =
      event.latitude && event.longitude
        ? `${Number(event.latitude).toFixed(4)}, ${Number(event.longitude).toFixed(4)}`
        : "---";

    row.innerHTML = `
            <td>${escapeHTML(event.date)}</td>
            <td>${escapeHTML(event.time)}</td>
            <td>${escapeHTML(event.type)}</td>
            <td>${escapeHTML(location)}</td>
            <td>${escapeHTML(event.status)}</td>
        `;

    table.appendChild(row);
  });
}

function clearHistory() {
  if (!confirm("Are you sure you want to clear emergency history?")) {
    return;
  }

  localStorage.removeItem("safeguardHistory");

  loadEmergencyHistory();

  updateDashboard();

  showToast("Emergency history cleared.", "success");
}

/* =========================================
   DASHBOARD UPDATE
========================================= */

function updateDashboard() {
  const contacts = getContacts();

  const history = getHistory();

  const contactCount = document.getElementById("contactCount");
  if (contactCount) contactCount.textContent = contacts.length;

  const eventCount = document.getElementById("eventCount");
  if (eventCount) eventCount.textContent = history.length;

  const status = document.getElementById("statusText");
  if (status) {
    status.textContent = emergencyActive ? "EMERGENCY" : "SAFE";
  }
}

/* =========================================
   EMERGENCY STATUS
========================================= */

function updateEmergencyStatus() {
  const status = document.getElementById("statusText");
  if (!status) return;

  status.textContent = "EMERGENCY";
  status.style.color = "#ff4757";
}

function resolveEmergency() {
  emergencyActive = false;
  const activeEmergency = localStorage.getItem("safeguardActiveEmergency");
  if (activeEmergency) {
    try {
      const record = JSON.parse(activeEmergency);
      record.status = "RESOLVED";
      record.resolvedAt = new Date().toISOString();
      localStorage.setItem("safeguardActiveEmergency", JSON.stringify(record));
    } catch (error) { console.error("Could not update emergency record:", error); }
  }

  const status = document.getElementById("statusText");
  if (status) {
    status.textContent = "SAFE";
    status.style.color = "";
  }

  saveEmergencyHistory(pendingEmergencyType, "Resolved");

  const result = document.getElementById("emergencyResult");
  if (result) result.classList.add("hidden");

  updateDashboard();

  showToast("Emergency resolved. Status is SAFE.", "success");
}

/* =========================================
   DEMO EMERGENCY
========================================= */

function demoEmergency() {
  activateDemoLocation();

  pendingEmergencyType = "Demo Emergency";

  emergencyActive = true;

  const typeLabel = document.getElementById("emergencyType");
  if (typeLabel) typeLabel.textContent = "Demo Emergency";

  localStorage.setItem("safeguardActiveEmergency", JSON.stringify({
    type: "Demo Emergency",
    activatedAt: new Date().toISOString(),
    location: currentLocation ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      demo: true
    } : null,
    status: "ACTIVE"
  }));

  const messageField = document.getElementById("emergencyMessage");
  if (messageField) messageField.value = generateEmergencyMessage();

  const result = document.getElementById("emergencyResult");
  if (result) {
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth" });
  }

  saveEmergencyHistory("Demo Emergency", "Activated");

  updateDashboard();

  showToast(
    "Demo emergency activated. DEMO LOCATION is being used.",
    "success",
  );
}

/* =========================================
   SECURITY HELPER
========================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================
   KEYBOARD ACCESSIBILITY
========================================= */

document.addEventListener("keydown", (event) => {
  /*
            Escape closes the countdown modal.
        */

  if (
    event.key === "Escape" &&
    document.getElementById("countdownModal") &&
    !document.getElementById("countdownModal").classList.contains("hidden")
  ) {
    cancelSOS();
  }
});
