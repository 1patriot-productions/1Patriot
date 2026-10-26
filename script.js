(function () {
  "use strict";

  const CONTACT_EMAIL = "RCDbyJen@gmail.com,Jenhayrit4@gmail.com";
  const CONTACT_EMAIL_DISPLAY = "RCDbyJen@gmail.com or Jenhayrit4@gmail.com";
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

/* ===== RCD order app ===== */
(function () {
  var app = document.getElementById("rw-app");
  if (!app) return;
  var screens = app.querySelectorAll(".rw-screen");
  var back = document.getElementById("rw-back");
  var history = [];
  var current = "splash";
  var state = { category: "", garment: "T-Shirt Front", color: "White", occasion: "", song: "Personalized Audio — 1 song (from $15)" };
  function show(name, noPush) {
    if (!noPush && name !== current) history.push(current);
    current = name;
    screens.forEach(function (s) { s.hidden = s.getAttribute("data-screen") !== name; });
    back.hidden = name === "splash";
  }
  back.addEventListener("click", function () { show(history.pop() || "splash", true); });
  var theme = document.getElementById("rw-theme");
  var preview = document.getElementById("rw-preview-img");
  theme.addEventListener("click", function () {
    var dark = app.getAttribute("data-theme") !== "dark";
    app.setAttribute("data-theme", dark ? "dark" : "light");
    theme.setAttribute("aria-pressed", String(dark));
    theme.textContent = dark ? "☀️ Light" : "🌙 Dark";
    if (preview) preview.src = dark ? "assets/order-preview-dark.jpg" : "assets/order-preview-light.jpg";
  });
  function fill(service, details) {
    var select = document.getElementById("service");
    var msg = document.getElementById("message");
    if (select) {
      var opt = Array.prototype.find.call(select.options, function (o) { return o.value === service; });
      select.value = opt ? service : "Other";
    }
    if (msg) msg.value = "Order request: " + details + "\n\nMy idea / quantities / sizes / date needed: ";
    var contact = document.getElementById("contact");
    if (contact) contact.scrollIntoView({ behavior: "smooth" });
    var nameEl = document.getElementById("name");
    if (nameEl) setTimeout(function () { nameEl.focus({ preventScroll: true }); }, 600);
  }
  app.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    var pick = e.target.closest("[data-pick]");
    var cat = e.target.closest("[data-cat]");
    if (cat) state.category = cat.getAttribute("data-cat");
    if (go) { show(go.getAttribute("data-go")); return; }
    if (pick) { fill(pick.getAttribute("data-pick"), state.category); }
  });
  function single(groupSel, cb) {
    app.querySelectorAll(groupSel).forEach(function (btn, _, all) {
      btn.addEventListener("click", function () {
        all.forEach(function (b) { b.classList.remove("on"); });
        btn.classList.add("on");
        cb(btn);
      });
    });
  }
  var shirtPath = document.getElementById("rw-shirt-path");
  var shirtLabel = document.getElementById("rw-shirt-label");
  var shirtExtra = document.getElementById("rw-shirt-extra");
  var shirtImg = document.getElementById("rw-shirt-img");
  var gName = document.getElementById("rw-garment-name");
  var SHAPES = {
    tee: { d: "M60 30 L85 20 Q100 35 115 20 L140 30 L175 60 L155 85 L140 75 L140 180 L60 180 L60 75 L45 85 L25 60 Z", x: "" },
    long: { d: "M60 30 L85 20 Q100 35 115 20 L140 30 L168 70 L186 170 L166 176 L142 92 L140 180 L60 180 L58 92 L34 176 L14 170 L32 70 Z", x: "M16 160 L36 166 M184 160 L164 166" },
    hoodie: { d: "M58 36 Q70 6 100 6 Q130 6 142 36 L168 70 L186 170 L166 176 L142 92 L140 182 L60 182 L58 92 L34 176 L14 170 L32 70 Z", x: "M78 34 Q100 58 122 34 M92 50 L90 84 M108 50 L110 84 M72 140 L128 140 L122 168 L78 168 Z" },
    tank: { d: "M72 22 L86 22 Q100 52 114 22 L128 22 Q130 62 148 74 L146 182 L54 182 L52 74 Q70 62 72 22 Z", x: "" }
  };
  function applyGarment(g) {
    var key = /Hoodie/.test(g) ? "hoodie" : /Long/.test(g) ? "long" : /Tank/.test(g) ? "tank" : "tee";
    shirtPath.setAttribute("d", SHAPES[key].d);
    shirtExtra.setAttribute("d", SHAPES[key].x);
    shirtLabel.textContent = g === "T-Shirt Back" ? "★ BACK ★" : "RCD ★";
    shirtImg.setAttribute("y", key === "hoodie" ? "70" : "62");
    if (gName) gName.textContent = g.replace("T-Shirt Front", "T-Shirt · Front").replace("T-Shirt Back", "T-Shirt · Back");
  }
  single(".rw-tabs button", function (b) {
    state.garment = b.getAttribute("data-garment");
    applyGarment(state.garment);
  });
  var upIn = document.getElementById("rw-upload-input");
  var upName = document.getElementById("rw-upload-name");
  var upClear = document.getElementById("rw-upload-clear");
  upIn.addEventListener("change", function () {
    var f = upIn.files && upIn.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { upName.textContent = "Please choose an image file."; return; }
    var rd = new FileReader();
    rd.onload = function () {
      state.upload = f.name; state.uploadData = rd.result;
      shirtImg.setAttribute("href", rd.result); shirtImg.style.display = "";
      shirtLabel.style.display = "none";
      upName.textContent = "Your design: " + f.name + " — please also attach it when you email your quote.";
      upClear.hidden = false;
    };
    rd.readAsDataURL(f);
  });
  upClear.addEventListener("click", function () {
    state.upload = ""; state.uploadData = ""; upIn.value = "";
    shirtImg.setAttribute("href", ""); shirtImg.style.display = "none"; shirtLabel.style.display = "";
    upName.textContent = "Upload a photo, logo or AI design from your phone — it previews on the shirt.";
    upClear.hidden = true;
  });
  // Hero category icons + outside links open the app like the in-app buttons
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-app-go],[data-app-pick]");
    if (!t || app.contains(t)) return;
    e.preventDefault();
    if (t.getAttribute("data-cat")) state.category = t.getAttribute("data-cat");
    if (t.hasAttribute("data-app-pick")) { fill(t.getAttribute("data-app-pick"), state.category); return; }
    show(t.getAttribute("data-app-go"));
    var sec = document.getElementById("order");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
    var foc = t.getAttribute("data-focus");
    if (foc) setTimeout(function () { var el = document.getElementById(foc); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 500);
  });
  single(".rw-swatches button", function (b) {
    state.color = b.getAttribute("data-color");
    shirtPath.style.setProperty("--shirt", b.style.getPropertyValue("--c"));
  });
  single('.rw-chips:not(.rw-single) button', function (b) { state.occasion = b.textContent; });
  single(".rw-single button", function (b) { state.song = b.getAttribute("data-pick-opt"); });
  document.getElementById("rw-shirt-go").addEventListener("click", function () {
    fill(/Clothing/.test(state.category) ? "Anything on Shirts (from $15)" : "Custom Design T-Shirts (from $15 · 2 for $25)",
      (state.category || "Custom Shirts") + " — " + state.garment + ", color: " + state.color +
      (state.occasion ? ", for: " + state.occasion : "") +
      (state.upload ? ", my uploaded design: " + state.upload + " (I'll attach it to the email)" : "") +
      " (AI design free with purchase)");
  });
  document.getElementById("rw-sound-go").addEventListener("click", function () {
    fill(state.song, "AI Soundtrack — " + state.song.replace("Personalized Audio — ", ""));
  });
  var search = document.getElementById("rw-search");
  search.addEventListener("input", function () {
    var q = search.value.toLowerCase();
    app.querySelectorAll("#rw-cats button").forEach(function (b) { b.hidden = q && b.textContent.toLowerCase().indexOf(q) === -1; });
  });
})();

/* ===== Payment placeholder =====
   Paste your Square / Squarespace checkout link between the quotes to show the Pay Now button. */
var PAYMENT_URL = '';
(function () {
  var wrap = document.getElementById("pay-now-wrap");
  var btn = document.getElementById("pay-now-btn");
  if (!wrap || !btn) return;
  if (PAYMENT_URL) { btn.href = PAYMENT_URL; wrap.hidden = false; } else { wrap.hidden = true; }
})();
