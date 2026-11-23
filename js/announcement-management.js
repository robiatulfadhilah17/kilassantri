(function () {
  "use strict";

  var storageKey = "kilassantri-announcements-v1";
  var mainElement = document.querySelector("#announcementMain");
  var sideElement = document.querySelector("#announcementSide");
  var gridElement = document.querySelector("#announcementGrid");
  var adminElement = document.querySelector("#announcementAdmin");
  var form = document.querySelector("#announcementForm");
  var feedback = document.querySelector("#announcementFormFeedback");
  var adminList = document.querySelector("#announcementAdminList");

  if (!mainElement || !sideElement || !gridElement) {
    return;
  }

  var sampleAnnouncements = [
    {
      id: "jumat-bersih",
      title: "Jumat Bersih",
      category: "PENGUMUMAN",
      date: "2026-11-27",
      time: "07.00 - Selesai",
      slogan: "Bersih Lingkungan, Nyaman Ibadah & Belajar",
      description: "WAJIB UNTUK SELURUH SANTRI.",
      photo: "images/kegiatan-kebersihan-santri-2.png",
      isMain: true
    },
    {
      id: "pemeriksaan-asrama",
      title: "Pemeriksaan Kebersihan Asrama",
      category: "PEMBERITAHUAN",
      date: "2026-11-22",
      slogan: "",
      description: "Pastikan kamar dan lingkungan dalam keadaan bersih dan rapi.",
      photo: "images/pemeriksaan-kebersihan-asrama.png",
      isMain: false
    },
    {
      id: "kerja-bakti",
      title: "Kerja Bakti Lingkungan Pondok",
      category: "PEMBERITAHUAN",
      date: "2026-11-25",
      slogan: "",
      description: "Mari bersama-sama menjaga kebersihan pondok kita.",
      photo: "images/kegiatan-kebersihan-santri.png",
      isMain: false
    },
    {
      id: "kamar-mandi",
      title: "Pembersihan Kamar Mandi",
      category: "PENGUMUMAN",
      date: "2026-11-24",
      slogan: "",
      description: "Mohon kerja samanya untuk menjaga kebersihan bersama.",
      photo: "images/pembersihan-kamar-mandi.png?v=20261122-1",
      isMain: false
    },
    {
      id: "taman-pondok",
      title: "Penataan Taman Pondok",
      category: "PEMBERITAHUAN",
      date: "2026-11-30",
      slogan: "",
      description: "Mari merawat tanaman dan menjaga keindahan lingkungan pondok.",
      photo: "images/penataan-taman-pesantren.jpg?v=20261123-1",
      isMain: false
    },
    {
      id: "jaga-kesehatan",
      title: "Jaga Kebersihan, Jaga Kesehatan",
      category: "INFO PENTING",
      date: "2026-11-21",
      slogan: "",
      description: "Lingkungan bersih, santri sehat, belajar semangat!",
      photo: "images/jaga-kebersihan-jaga-kesehatan.jpg?v=20261122-1",
      isMain: false
    }
  ];

  var announcements = loadAnnouncements();

  function loadAnnouncements() {
    try {
      var saved = localStorage.getItem(storageKey);
      if (!saved) {
        localStorage.setItem(storageKey, JSON.stringify(sampleAnnouncements));
        return sampleAnnouncements.slice();
      }
      var parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        parsed.forEach(function (item) {
          if (item.id === "pemeriksaan-asrama") {
            item.photo = "images/pemeriksaan-kebersihan-asrama.png";
          }
          if (item.id === "taman-pondok") {
            item.photo = "images/penataan-taman-pesantren.jpg?v=20261123-1";
          }
          if (item.id === "jaga-kesehatan") {
            item.photo = "images/jaga-kebersihan-jaga-kesehatan.jpg?v=20261122-1";
          }
          if (item.id === "kamar-mandi") {
            item.photo = "images/pembersihan-kamar-mandi.png?v=20261122-1";
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(parsed));
        return parsed;
      }
    } catch (error) {}
    return sampleAnnouncements.slice();
  }

  function saveAnnouncements() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(announcements));
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
    if (!value) return "";
    var date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) return value;
    var months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  }

  function photoFor(item) {
    return item.photo || "images/kegiatan-kebersihan-santri.png";
  }

  function mainMarkup(item) {
    var titleMarkup = item.title === "Jumat Bersih"
      ? "Jumat<span>Bersih</span>"
      : escapeHtml(item.title);
    return '<div class="announcement-main-copy">' +
      '<span class="announcement-label">' + escapeHtml(item.category) + '</span>' +
      '<h3>' + titleMarkup + '</h3>' +
      '<p class="announcement-main-slogan">' + escapeHtml(item.slogan || item.description) + '</p>' +
      '<div class="announcement-main-meta"><i class="bi bi-calendar3"></i><span>' +
      escapeHtml(item.title === "Jumat Bersih" ? "Jumat, " + formatDate(item.date) + " | " + (item.time || "07.00 - Selesai") : formatDate(item.date)) +
      '</span></div>' +
      '<span class="announcement-main-required">' + escapeHtml(item.description) + '</span>' +
      '</div><div class="announcement-main-photo"><img src="' + escapeHtml(photoFor(item)) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></div>';
  }

  function sideMarkup(item) {
    var icon = item.id === "pemeriksaan-asrama" ? "bi-clipboard-check" : "bi-basket";
    var photoClass = item.id === "pemeriksaan-asrama" ? ' class="announcement-asrama-photo"' : "";
    return '<article class="announcement-side-card">' +
      '<div class="announcement-side-copy"><span class="announcement-label">' + escapeHtml(item.category) + '</span>' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<div class="announcement-side-card-meta"><i class="bi ' + icon + '"></i><span>' + escapeHtml(formatDate(item.date)) + '</span></div>' +
      '<p class="announcement-side-description' + (item.id === "pemeriksaan-asrama" ? ' announcement-asrama-description' : '') + '">' + escapeHtml(item.description) + '</p></div>' +
      '<div class="announcement-side-photo"><img' + photoClass + ' src="' + escapeHtml(photoFor(item)) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></div></article>';
  }

  function gridMarkup(item) {
    var isShield = !item.photo;
    var icon = item.id === "kamar-mandi" ? "bi-moisture" : (item.id === "taman-pondok" ? "bi-flower1" : "bi-shield-check");
    var photoClass = item.id === "taman-pondok"
      ? " announcement-taman-photo"
      : (item.id === "jaga-kesehatan"
        ? " announcement-kesehatan-photo"
        : (item.id === "kamar-mandi" ? " announcement-kamar-mandi-photo" : ""));
    var photo = isShield
      ? '<div class="announcement-grid-card-photo is-shield"><i class="bi bi-shield-leaf" aria-hidden="true"></i></div>'
      : '<div class="announcement-grid-card-photo' + photoClass + '"><img src="' + escapeHtml(photoFor(item)) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></div>';
    return '<article class="announcement-grid-card"><div class="announcement-grid-card-copy">' +
      '<span class="announcement-label">' + escapeHtml(item.category) + '</span>' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<div class="announcement-grid-card-meta"><i class="bi ' + icon + '"></i><span>' +
      (item.date ? escapeHtml(item.title === "Penataan Taman Pondok" ? "Jumat, " + formatDate(item.date) : "Sabtu, " + formatDate(item.date)) : "") +
      '</span></div><p class="announcement-grid-description">' + escapeHtml(item.description) + '</p></div>' + photo + '</article>';
  }

  function render() {
    var main = announcements.find(function (item) { return item.isMain; }) || announcements[0];
    mainElement.innerHTML = mainMarkup(main);

    var side = announcements.filter(function (item) { return item.id !== main.id; }).slice(0, 2);
    sideElement.innerHTML = side.map(sideMarkup).join("");

    var bottom = announcements.filter(function (item) { return item.id !== main.id && side.indexOf(item) === -1; }).slice(0, 3);
    gridElement.innerHTML = bottom.map(gridMarkup).join("");

    renderAdminList();
  }

  function renderAdminList() {
    if (!adminList) return;
    adminList.innerHTML = announcements.map(function (item) {
      var image = item.photo ? escapeHtml(item.photo) : "";
      var imageMarkup = image
        ? '<img src="' + image + '" alt="">'
        : '<span style="display:grid;width:84px;height:58px;place-items:center;border-radius:6px;background:#e7efe9;color:#1e6047;font-size:1.7rem"><i class="bi bi-shield-leaf"></i></span>';
      return '<div class="announcement-admin-item">' + imageMarkup +
        '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.category) + ' | ' + escapeHtml(formatDate(item.date)) + (item.isMain ? ' | UTAMA' : '') + '</span></div>' +
        '<div class="announcement-admin-item-actions">' +
        '<button type="button" data-edit="' + escapeHtml(item.id) + '" aria-label="Edit"><i class="bi bi-pencil"></i></button>' +
        '<button type="button" data-delete="' + escapeHtml(item.id) + '" aria-label="Hapus"><i class="bi bi-trash"></i></button></div></div>';
    }).join("");
  }

  function openAdmin() {
    adminElement.classList.add("is-open");
    adminElement.setAttribute("aria-hidden", "false");
  }

  function closeAdmin() {
    adminElement.classList.remove("is-open");
    adminElement.setAttribute("aria-hidden", "true");
    resetForm();
  }

  function resetForm() {
    form.reset();
    document.querySelector("#announcementId").value = "";
    document.querySelector("#announcementPhoto").required = false;
    feedback.textContent = "";
  }

  document.querySelector("#openAnnouncementAdmin").addEventListener("click", openAdmin);
  document.querySelector("#closeAnnouncementAdmin").addEventListener("click", closeAdmin);
  document.querySelector("#cancelAnnouncementEdit").addEventListener("click", resetForm);

  adminList.addEventListener("click", function (event) {
    var editButton = event.target.closest("[data-edit]");
    var deleteButton = event.target.closest("[data-delete]");
    if (editButton) {
      var item = announcements.find(function (entry) { return entry.id === editButton.dataset.edit; });
      if (!item) return;
      document.querySelector("#announcementId").value = item.id;
      document.querySelector("#announcementName").value = item.title;
      document.querySelector("#announcementCategory").value = item.category === "INFORMASI" ? "PENGUMUMAN" : item.category;
      document.querySelector("#announcementDate").value = item.date || "";
      document.querySelector("#announcementDescription").value = item.description || "";
      document.querySelector("#announcementSlogan").value = item.slogan || "";
      document.querySelector("#announcementMainCheck").checked = Boolean(item.isMain);
      feedback.textContent = "Mode edit: " + item.title;
    }
    if (deleteButton) {
      var id = deleteButton.dataset.delete;
      if (!confirm("Hapus pengumuman ini?")) return;
      announcements = announcements.filter(function (entry) { return entry.id !== id; });
      if (!announcements.some(function (entry) { return entry.isMain; }) && announcements.length) {
        announcements[0].isMain = true;
      }
      if (saveAnnouncements()) {
        render();
        feedback.textContent = "Pengumuman berhasil dihapus.";
      }
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var id = document.querySelector("#announcementId").value;
    var isMain = document.querySelector("#announcementMainCheck").checked;
    var photoInput = document.querySelector("#announcementPhoto");

    function finish(photo) {
      var item = {
        id: id || "announcement-" + Date.now(),
        title: document.querySelector("#announcementName").value.trim(),
        category: document.querySelector("#announcementCategory").value,
        date: document.querySelector("#announcementDate").value,
        slogan: document.querySelector("#announcementSlogan").value.trim(),
        description: document.querySelector("#announcementDescription").value.trim(),
        photo: photo,
        isMain: isMain
      };
      if (!item.title || !item.category || !item.date || !item.description) {
        feedback.textContent = "Lengkapi semua bidang yang diperlukan.";
        feedback.className = "announcement-form-feedback is-error";
        return;
      }
      if (isMain) announcements.forEach(function (entry) { entry.isMain = false; });
      if (id) {
        var index = announcements.findIndex(function (entry) { return entry.id === id; });
        item.photo = photo || announcements[index].photo;
        announcements[index] = item;
      } else {
        item.photo = photo || "images/kegiatan-kebersihan-santri.png";
        announcements.push(item);
      }
      if (!announcements.some(function (entry) { return entry.isMain; })) {
        announcements[0].isMain = true;
      }
      if (saveAnnouncements()) {
        render();
        resetForm();
        feedback.textContent = "Pengumuman berhasil disimpan.";
      } else {
        feedback.textContent = "Data terlalu besar atau penyimpanan browser tidak tersedia.";
        feedback.className = "announcement-form-feedback is-error";
      }
    }

    if (photoInput.files && photoInput.files[0]) {
      var file = photoInput.files[0];
      if (file.size > 2 * 1024 * 1024) {
        feedback.textContent = "Ukuran foto maksimal 2 MB.";
        feedback.className = "announcement-form-feedback is-error";
        return;
      }
      var reader = new FileReader();
      reader.onload = function () { finish(reader.result); };
      reader.readAsDataURL(file);
    } else {
      finish("");
    }
  });

  render();
})();
