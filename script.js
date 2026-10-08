(function () {
  "use strict";

  const CONTACT_EMAIL = "RCDbyjen@gmail.com,Jenhayrit4@gmail.com";
  const CONTACT_EMAIL_DISPLAY = "RCDbyjen@gmail.com or Jenhayrit4@gmail.com";
  const PARTY_PER_PERSON = 10;

  // Year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // Service filters
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".service-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      cards.forEach(function (card) {
        const cat = card.getAttribute("data-category");
        const show = filter === "all" || cat === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  // Preselect service from CTA links
  document.querySelectorAll("[data-preselect]").forEach(function (el) {
    el.addEventListener("click", function () {
      const value = el.getAttribute("data-preselect");
      const select = document.getElementById("service");
      if (select && value) {
        const options = Array.from(select.options);
        const match = options.find(function (o) {
          return o.value === value || o.textContent === value;
        });
        if (match) {
          select.value = match.value;
        } else {
          // Fuzzy: match by leading text before "("
          const key = value.split("(")[0].trim().toLowerCase();
          const fuzzy = options.find(function (o) {
            return o.value.toLowerCase().indexOf(key) === 0;
          });
          if (fuzzy) select.value = fuzzy.value;
        }
      }
    });
  });

  // Party estimator
  const guestInput = document.getElementById("guest-count");
  const estimateTotal = document.getElementById("estimate-total");
  const estimateBreakdown = document.getElementById("estimate-breakdown");
  const addonInputs = document.querySelectorAll("[data-addon-price]");
  const audioGroup = document.querySelectorAll("[data-audio-group]");

  function formatMoney(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function updateEstimate() {
    if (!guestInput || !estimateTotal) return;
    let guests = parseInt(guestInput.value, 10);
    if (isNaN(guests) || guests < 1) guests = 0;
    if (guests > 500) {
      guests = 500;
      guestInput.value = "500";
    }

    const base = guests * PARTY_PER_PERSON;
    const parts = [];
    if (guests > 0) {
      parts.push(guests + " guests × $" + PARTY_PER_PERSON + " = " + formatMoney(base) + " base");
    } else {
      parts.push("Enter guest count for base estimate");
    }

    let addons = 0;
    addonInputs.forEach(function (input) {
      if (input.checked) {
        const price = parseInt(input.getAttribute("data-addon-price"), 10) || 0;
        addons += price;
        const label = input.parentElement
          ? input.parentElement.textContent.replace(/\s+/g, " ").trim()
          : "Add-on";
        const short = label.split("(")[0].trim();
        parts.push("+ " + short + " " + formatMoney(price));
      }
    });

    const total = base + addons;
    estimateTotal.textContent = formatMoney(total);
    if (estimateBreakdown) {
      estimateBreakdown.textContent = parts.join(" · ");
    }
  }

  // Soundtrack packages are mutually exclusive
  audioGroup.forEach(function (box) {
    box.addEventListener("change", function () {
      if (box.checked) {
        audioGroup.forEach(function (other) {
          if (other !== box) other.checked = false;
        });
      }
      updateEstimate();
    });
  });

  if (guestInput) {
    guestInput.addEventListener("input", updateEstimate);
    guestInput.addEventListener("change", updateEstimate);
  }
  addonInputs.forEach(function (input) {
    if (!input.hasAttribute("data-audio-group")) {
      input.addEventListener("change", updateEstimate);
    }
  });
  updateEstimate();

  // Form validation + mailto / success UX
  const form = document.getElementById("quote-form");
  const success = document.getElementById("form-success");
  const successNote = document.getElementById("success-note");
  const messageCopy = document.getElementById("message-copy");
  const copyBtn = document.getElementById("copy-btn");
  const resetBtn = document.getElementById("reset-form-btn");

  function setError(id, msg) {
    const input = document.getElementById(id);
    const err = document.getElementById(id + "-error");
    if (input) input.classList.add("invalid");
    if (err) {
      err.hidden = !msg;
      err.textContent = msg || "";
    }
  }

  function clearError(id) {
    const input = document.getElementById(id);
    const err = document.getElementById(id + "-error");
    if (input) input.classList.remove("invalid");
    if (err) {
      err.hidden = true;
      err.textContent = "";
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function buildBody(data) {
    return [
      "New quote request from Ritzie Custom Designs website",
      "",
      "Name: " + data.name,
      "Email: " + data.email,
      "Phone: " + (data.phone || "(not provided)"),
      "Service: " + data.service,
      "",
      "Message:",
      data.message,
    ].join("\n");
  }

  function validate() {
    let ok = true;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();

    ["name", "email", "phone", "service", "message"].forEach(clearError);

    if (!name) {
      setError("name", "Please enter your name.");
      ok = false;
    }
    if (!email) {
      setError("email", "Please enter your email.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setError("email", "Please enter a valid email address.");
      ok = false;
    }
    if (phone && phone.replace(/\D/g, "").length < 7) {
      setError("phone", "Please enter a valid phone number (or leave blank).");
      ok = false;
    }
    if (!service) {
      setError("service", "Please select a service.");
      ok = false;
    }
    if (!message) {
      setError("message", "Please tell us about your project.");
      ok = false;
    } else if (message.length < 10) {
      setError("message", "Please add a bit more detail (at least 10 characters).");
      ok = false;
    }

    return ok
      ? { name: name, email: email, phone: phone, service: service, message: message }
      : null;
  }

  if (form) {
    ["name", "email", "phone", "service", "message"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", function () {
          clearError(id);
        });
        el.addEventListener("change", function () {
          clearError(id);
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = validate();
      if (!data) {
        const firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const subject = "Quote request: " + data.service + " — " + data.name;
      const body = buildBody(data);
      const mailto =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      let mailtoOpened = false;
      try {
        window.location.href = mailto;
        mailtoOpened = true;
      } catch (err) {
        mailtoOpened = false;
      }

      form.hidden = true;
      if (success) {
        success.hidden = false;
        if (successNote) {
          successNote.textContent = mailtoOpened
            ? "If your email app opened, just hit send. Otherwise, copy the message below and email it to " +
              CONTACT_EMAIL_DISPLAY +
              "."
            : "Copy the message below and email it to " + CONTACT_EMAIL_DISPLAY + ".";
        }
        if (messageCopy) {
          messageCopy.textContent =
            "To: " + CONTACT_EMAIL + "\nSubject: " + subject + "\n\n" + body;
        }
        success.focus();
      }
    });
  }

  if (copyBtn && messageCopy) {
    copyBtn.addEventListener("click", async function () {
      const text = messageCopy.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.textContent = "Copy message";
        }, 2000);
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(messageCopy);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = "Selected — press Ctrl/Cmd+C";
      }
    });
  }

  if (resetBtn && form && success) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      form.hidden = false;
      success.hidden = true;
      ["name", "email", "phone", "service", "message"].forEach(clearError);
      document.getElementById("name").focus();
    });
  }
})();
