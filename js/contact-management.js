(function () {
  "use strict";

  var storageKey = "kilassantri-contact-messages-v1";
  var form = document.querySelector("#contactForm");
  var feedback = document.querySelector("#contactFormFeedback");
  var admin = document.querySelector("#contactAdmin");
  var adminList = document.querySelector("#contactAdminList");
  var statusFilter = document.querySelector("#contactStatusFilter");
  var unreadCount = document.querySelector("#contactUnreadCount");

  if (!form || !admin || !adminList) {
    return;
  }

  var messages = loadMessages();

  function loadMessages() {
    try {
      var saved = localStorage.getItem(storageKey);
      if (!saved) return [];
      var parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(isValidMessage) : [];
    } catch (error) {
      return [];
    }
  }

  function isValidMessage(message) {
    return message &&
      typeof message.id === "string" &&
      typeof message.name === "string" &&
      typeof message.category === "string" &&
      typeof message.area === "string" &&
      typeof message.subject === "string" &&
      typeof message.message === "string";
  }

  function saveMessages() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHtml(value) {
    var element = document.createElement("div");
    element.textContent = value == null ? "" : String(value);
    return element.innerHTML;
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function openAdmin() {
    admin.classList.add("is-open");
    admin.setAttribute("aria-hidden", "false");
    renderAdmin();
  }

  function closeAdmin() {
    admin.classList.remove("is-open");
    admin.setAttribute("aria-hidden", "true");
  }

  document.querySelector("#openContactAdmin").addEventListener("click", openAdmin);
  document.querySelector("#closeContactAdmin").addEventListener("click", closeAdmin);
  admin.addEventListener("click", function (event) {
    if (event.target === admin) closeAdmin();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && admin.classList.contains("is-open")) closeAdmin();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      feedback.textContent = "Lengkapi seluruh kolom yang diwajibkan.";
      feedback.className = "contact-form-feedback is-error";
      return;
    }

    var message = {
      id: "pesan-" + Date.now(),
      name: document.querySelector("#contactName").value.trim(),
      category: document.querySelector("#contactCategory").value,
      area: document.querySelector("#contactArea").value.trim(),
      subject: document.querySelector("#contactSubject").value.trim(),
      message: document.querySelector("#contactMessage").value.trim(),
      status: "Pesan Diterima",
      response: "",
      createdAt: new Date().toISOString()
    };

    messages.unshift(message);
    if (saveMessages()) {
      form.reset();
      form.classList.remove("was-validated");
      feedback.textContent = "Pesan berhasil dikirim dan telah diterima oleh Divisi Kebersihan.";
      feedback.className = "contact-form-feedback";
    } else {
      messages.shift();
      feedback.textContent = "Pesan gagal disimpan. Penyimpanan browser tidak tersedia atau penuh.";
      feedback.className = "contact-form-feedback is-error";
    }
  });

  statusFilter.addEventListener("change", renderAdmin);

  function statusClass(status) {
    if (status === "Sedang Diproses") return "contact-status-badge is-processing";
    if (status === "Selesai Ditanggapi") return "contact-status-badge is-complete";
    return "contact-status-badge";
  }

  function renderAdmin() {
    var filter = statusFilter.value;
    var visibleMessages = messages.filter(function (message) {
      return !filter || message.status === filter;
    });

    unreadCount.textContent = messages.length + " pesan";
    if (!visibleMessages.length) {
      adminList.innerHTML = '<div class="contact-admin-empty"><i class="bi-inbox"></i><p>Belum ada pesan yang cocok.</p></div>';
      return;
    }

    adminList.innerHTML = visibleMessages.map(function (message) {
      var currentStatus = message.status || "Pesan Diterima";
      return '<article class="contact-admin-card">' +
        '<div class="contact-admin-card-header">' +
          '<div><h4>' + escapeHtml(message.subject) + '</h4>' +
          '<p>' + escapeHtml(message.name) + ' &middot; ' + escapeHtml(formatDate(message.createdAt)) + '</p></div>' +
          '<span class="' + statusClass(currentStatus) + '">' + escapeHtml(currentStatus) + '</span>' +
        '</div>' +
        '<div class="contact-admin-card-body">' +
          '<div class="contact-message-meta">' +
            '<span>Kategori: ' + escapeHtml(message.category) + '</span>' +
            '<span>Asrama / Bagian: ' + escapeHtml(message.area) + '</span>' +
          '</div>' +
          '<p>' + escapeHtml(message.message) + '</p>' +
        '</div>' +
        '<div class="contact-admin-card-actions">' +
          '<div><label for="status-' + escapeHtml(message.id) + '">Status pesan</label>' +
          '<select class="form-select contact-status-select" id="status-' + escapeHtml(message.id) + '" data-message-id="' + escapeHtml(message.id) + '">' +
            '<option value="Pesan Diterima"' + (currentStatus === "Pesan Diterima" ? " selected" : "") + '>Pesan Diterima</option>' +
            '<option value="Sedang Diproses"' + (currentStatus === "Sedang Diproses" ? " selected" : "") + '>Sedang Diproses</option>' +
            '<option value="Selesai Ditanggapi"' + (currentStatus === "Selesai Ditanggapi" ? " selected" : "") + '>Selesai Ditanggapi</option>' +
          '</select></div>' +
          '<div><label for="response-' + escapeHtml(message.id) + '">Tanggapan</label>' +
          '<textarea class="form-control contact-response-input" id="response-' + escapeHtml(message.id) + '" data-message-id="' + escapeHtml(message.id) + '" maxlength="2000" placeholder="Tuliskan tanggapan untuk pengirim">' +
          escapeHtml(message.response || "") + '</textarea></div>' +
          '<button type="button" class="contact-save-response" data-message-id="' + escapeHtml(message.id) + '"><i class="bi-check2"></i> Simpan</button>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  adminList.addEventListener("change", function (event) {
    if (!event.target.classList.contains("contact-status-select")) return;
    var id = event.target.dataset.messageId;
    var message = messages.find(function (item) { return item.id === id; });
    if (!message) return;
    message.status = event.target.value;
    saveMessages();
    renderAdmin();
  });

  adminList.addEventListener("click", function (event) {
    var button = event.target.closest(".contact-save-response");
    if (!button) return;
    var id = button.dataset.messageId;
    var message = messages.find(function (item) { return item.id === id; });
    var responseInput = adminList.querySelector('.contact-response-input[data-message-id="' + id + '"]');
    if (!message || !responseInput) return;
    message.response = responseInput.value.trim();
    if (message.status !== "Selesai Ditanggapi" && message.response) {
      message.status = "Selesai Ditanggapi";
    }
    if (saveMessages()) {
      renderAdmin();
    }
  });

  renderAdmin();
})();
