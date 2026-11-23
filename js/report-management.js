(function () {
  "use strict";

  var dashboard = document.querySelector("#laporan-kegiatan");
  if (!dashboard) {
    return;
  }

  var storageKey = "kilassantri-activity-reports-v1";
  var maxUploadBytes = 4 * 1024 * 1024;
  var maxStoredPhotoLength = 1000000;
  var reportGrid = document.querySelector("#reportGrid");
  var reportFeedback = document.querySelector("#reportFeedback");
  var reportEmpty = document.querySelector("#reportEmpty");
  var typeFilter = document.querySelector("#reportTypeFilter");
  var monthFilter = document.querySelector("#reportMonthFilter");
  var dateFilter = document.querySelector("#reportDateFilter");
  var reportForm = document.querySelector("#reportForm");
  var reportNameInput = document.querySelector("#reportName");
  var reportFormFeedback = document.querySelector("#reportFormFeedback");
  var photoInput = document.querySelector("#reportPhoto");
  var photoPreview = document.querySelector("#reportPhotoPreview");
  var photoPlaceholder = document.querySelector("#reportPhotoPlaceholder");
  var saveReportButton = document.querySelector("#saveReportButton");
  var isPhotoProcessing = false;
  var previewObjectUrl = "";
  var formModalElement = document.querySelector("#reportFormModal");
  var detailModalElement = document.querySelector("#reportDetailModal");
  var reportActivityTypes = [
    "Kegiatan Jumat Bersih",
    "Kerja Bakti Lingkungan Pondok",
    "Pemeriksaan Kebersihan Asrama",
    "Pembersihan Kamar Mandi",
    "Penataan Taman Pondok"
  ];

  var sampleReports = [
    {
      id: "sample-jumat-bersih",
      name: "Kegiatan Jumat Bersih",
      date: "2026-11-20",
      location: "Halaman dan area masjid pondok",
      responsible: "Divisi Kebersihan",
      participants: 32,
      status: "Terlaksana",
      photo: "images/galeri-persiapan-kerja-bakti.jpg"
    },
    {
      id: "sample-kerja-bakti",
      name: "Kerja Bakti Lingkungan Pondok",
      date: "2026-11-13",
      location: "Lingkungan sekitar pondok",
      responsible: "Koordinator Kebersihan",
      participants: 28,
      status: "Terlaksana",
      photo: "images/galeri-kerja-bakti-roda-sampah.jpeg"
    },
    {
      id: "sample-pemeriksaan-asrama",
      name: "Pemeriksaan Kebersihan Asrama",
      date: "2026-11-06",
      location: "Asrama santri",
      responsible: "Pengurus Asrama",
      participants: 6,
      status: "Terlaksana",
      photo: "images/pemeriksaan-kebersihan-asrama.png"
    },
    {
      id: "sample-pembersihan-kamar-mandi",
      name: "Pembersihan Kamar Mandi",
      date: "2026-10-30",
      location: "Kamar mandi asrama",
      responsible: "Koordinator Piket Asrama",
      participants: 12,
      status: "Terlaksana",
      photo: "images/galeri-membersihkan-aula.jpg"
    },
    {
      id: "sample-penataan-taman",
      name: "Penataan Taman Pondok",
      date: "2026-10-23",
      location: "Taman pondok",
      responsible: "Tim Lingkungan",
      participants: 10,
      status: "Terlaksana",
      photo: "images/penataan-taman-pesantren.jpg"
    }
  ];

  var reports = [];
  var detailModal = new bootstrap.Modal(detailModalElement);

  var showFeedback = function (message, isError) {
    reportFeedback.textContent = message;
    reportFeedback.classList.toggle("is-error", Boolean(isError));
  };

  var showFormFeedback = function (message, isError) {
    reportFormFeedback.textContent = message;
    reportFormFeedback.classList.toggle("is-error", Boolean(isError));
  };

  var isSafePhoto = function (photo) {
    if (typeof photo !== "string") {
      return false;
    }

    var isUploadedPhoto = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo);
    var isProjectPhoto = /^images\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|webp)$/i.test(photo) && photo.indexOf("..") === -1;
    return isUploadedPhoto || isProjectPhoto;
  };

  var isValidDate = function (dateValue) {
    if (typeof dateValue !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return false;
    }

    var parts = dateValue.split("-");
    var date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    return date.getUTCFullYear() === Number(parts[0]) &&
      date.getUTCMonth() === Number(parts[1]) - 1 &&
      date.getUTCDate() === Number(parts[2]);
  };

  var isValidReport = function (report) {
    return report &&
      typeof report.id === "string" && report.id.trim().length > 0 &&
      typeof report.name === "string" && report.name.trim().length > 0 &&
      isValidDate(report.date) &&
      typeof report.location === "string" && report.location.trim().length > 0 &&
      typeof report.responsible === "string" && report.responsible.trim().length > 0 &&
      Number.isInteger(report.participants) && report.participants > 0 &&
      report.status === "Terlaksana" &&
      isSafePhoto(report.photo);
  };

  var loadReports = function () {
    try {
      var savedReports = localStorage.getItem(storageKey);
      if (savedReports === null) {
        localStorage.setItem(storageKey, JSON.stringify(sampleReports));
        return sampleReports.slice();
      }

      var parsedReports = JSON.parse(savedReports);
      if (!Array.isArray(parsedReports) || !parsedReports.every(isValidReport)) {
        throw new Error("Data laporan tersimpan tidak valid.");
      }

      var hasSavedDescriptions = parsedReports.some(function (report) {
        return Object.prototype.hasOwnProperty.call(report, "description");
      });
      var hasUpdatedGardenPhoto = false;
      var hasUpdatedAsramaPhoto = false;
      parsedReports.forEach(function (report) {
        if (report.id === "sample-penataan-taman" && report.photo !== "images/penataan-taman-pesantren.jpg") {
          report.photo = "images/penataan-taman-pesantren.jpg";
          hasUpdatedGardenPhoto = true;
        }
        if (report.name === "Pemeriksaan Kebersihan Asrama" &&
          report.photo !== "images/pemeriksaan-kebersihan-asrama.png") {
          report.photo = "images/pemeriksaan-kebersihan-asrama.png";
          hasUpdatedAsramaPhoto = true;
        }
      });
      if (hasSavedDescriptions || hasUpdatedGardenPhoto || hasUpdatedAsramaPhoto) {
        parsedReports.forEach(function (report) {
          delete report.description;
        });
        localStorage.setItem(storageKey, JSON.stringify(parsedReports));
      }

      return parsedReports;
    } catch (error) {
      showFeedback("Data laporan tidak dapat dibaca atau disimpan. Periksa penyimpanan browser atau data yang tersimpan.", true);
      return sampleReports.slice();
    }
  };

  var saveReports = function (nextReports) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextReports));
      reports = nextReports;
      renderReports();
      return true;
    } catch (error) {
      showFormFeedback("Laporan gagal disimpan. Penyimpanan browser mungkin penuh atau diblokir. Coba foto yang lebih kecil.", true);
      return false;
    }
  };

  var formatDate = function (dateValue) {
    var date = new Date(dateValue + "T00:00:00");
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  var createElement = function (tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (typeof text === "string") {
      element.textContent = text;
    }
    return element;
  };

  var createMetaItem = function (iconClass, text) {
    var item = createElement("span");
    var icon = createElement("i", iconClass);
    icon.setAttribute("aria-hidden", "true");
    item.appendChild(icon);
    item.appendChild(document.createTextNode(text));
    return item;
  };

  var createActionButton = function (label, action, reportId, className, iconClass) {
    var button = createElement("button", className);
    button.type = "button";
    button.dataset.reportAction = action;
    button.dataset.reportId = reportId;
    var icon = createElement("i", iconClass);
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);
    button.appendChild(document.createTextNode(" " + label));
    return button;
  };

  var createReportCard = function (report) {
    var column = createElement("div", "col-12 col-md-6 col-xl-4");
    var card = createElement("article", "report-card");
    var imageWrap = createElement("div", "report-card-image-wrap");
    var image = createElement("img", "report-card-image");
    image.src = report.photo;
    image.alt = "Dokumentasi " + report.name;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function () {
      image.alt = "Foto dokumentasi tidak dapat dimuat: " + report.name;
      image.classList.add("is-unavailable");
    });

    var status = createElement("span", "report-status");
    var statusIcon = createElement("i", "bi-check-circle-fill");
    statusIcon.setAttribute("aria-hidden", "true");
    status.appendChild(statusIcon);
    status.appendChild(document.createTextNode(" " + report.status));
    imageWrap.appendChild(image);
    imageWrap.appendChild(status);

    var body = createElement("div", "report-card-body");
    body.appendChild(createElement("h4", "report-card-title", report.name));
    var meta = createElement("div", "report-card-meta");
    meta.appendChild(createMetaItem("bi-calendar3", formatDate(report.date)));
    meta.appendChild(createMetaItem("bi-geo-alt", report.location));
    body.appendChild(meta);

    var actions = createElement("div", "report-card-actions");
    actions.appendChild(createActionButton("Lihat Detail", "detail", report.id, "report-add-button", "bi-arrow-up-right"));
    actions.appendChild(createActionButton("Edit", "edit", report.id, "report-secondary-button", "bi-pencil"));
    actions.appendChild(createActionButton("Hapus", "delete", report.id, "report-delete-button", "bi-trash"));
    body.appendChild(actions);

    card.appendChild(imageWrap);
    card.appendChild(body);
    column.appendChild(card);
    return column;
  };

  var renderReports = function () {
    var selectedType = typeFilter.value;
    var selectedMonth = monthFilter.value;
    var selectedDate = dateFilter.value;
    var filteredReports = reports.filter(function (report) {
      return (!selectedType || report.name === selectedType) &&
        (!selectedMonth || report.date.slice(0, 7) === selectedMonth) &&
        (!selectedDate || report.date === selectedDate);
    }).sort(function (first, second) {
      return second.date.localeCompare(first.date);
    });

    reportGrid.replaceChildren();
    filteredReports.forEach(function (report) {
      reportGrid.appendChild(createReportCard(report));
    });

    document.querySelector("#reportTotal").textContent = String(reports.length);
    document.querySelector("#reportCompleted").textContent = String(reports.filter(function (report) {
      return report.status === "Terlaksana";
    }).length);
    reportEmpty.classList.toggle("d-none", filteredReports.length > 0);
    reportGrid.classList.toggle("d-none", filteredReports.length === 0);
  };

  var setPreview = function (photoSource) {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = "";
    }
    photoPreview.src = photoSource;
    photoPreview.classList.remove("d-none");
    photoPlaceholder.classList.add("d-none");
  };

  var clearPreview = function () {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = "";
    }
    photoPreview.removeAttribute("src");
    photoPreview.classList.add("d-none");
    photoPlaceholder.classList.remove("d-none");
  };

  var setPhotoProcessing = function (processing) {
    isPhotoProcessing = processing;
    if (saveReportButton) {
      saveReportButton.disabled = processing;
    }
  };

  var resetReportForm = function () {
    Array.prototype.forEach.call(reportNameInput.querySelectorAll("option[data-legacy]"), function (option) {
      option.remove();
    });
    reportForm.reset();
    reportForm.dataset.currentPhoto = "";
    setPhotoProcessing(false);
    document.querySelector("#reportId").value = "";
    photoInput.required = true;
    clearPreview();
    showFormFeedback("", false);
    document.querySelector("#reportFormModalTitle").textContent = "Tambah Laporan";
  };

  var openReportForm = function (reportId) {
    resetReportForm();
    if (reportId) {
      var report = reports.find(function (item) {
        return item.id === reportId;
      });
      if (!report) {
        showFeedback("Laporan yang ingin diedit tidak ditemukan.", true);
        return;
      }

      document.querySelector("#reportId").value = report.id;
      if (reportActivityTypes.indexOf(report.name) === -1) {
        var legacyOption = document.createElement("option");
        legacyOption.value = report.name;
        legacyOption.textContent = report.name;
        legacyOption.dataset.legacy = "true";
        reportNameInput.appendChild(legacyOption);
      }
      reportNameInput.value = report.name;
      document.querySelector("#reportDate").value = report.date;
      document.querySelector("#reportLocation").value = report.location;
      document.querySelector("#reportResponsible").value = report.responsible;
      document.querySelector("#reportParticipants").value = String(report.participants);
      reportForm.dataset.currentPhoto = report.photo;
      photoInput.required = false;
      setPreview(report.photo);
      document.querySelector("#reportFormModalTitle").textContent = "Edit Laporan";
    }
    formModalElement.classList.remove("d-none");
    formModalElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  var setDetailText = function (id, value) {
    document.querySelector("#" + id).textContent = value;
  };

  var openReportDetail = function (reportId) {
    var report = reports.find(function (item) {
      return item.id === reportId;
    });
    if (!report) {
      showFeedback("Laporan yang ingin dibuka tidak ditemukan.", true);
      return;
    }

    setDetailText("reportDetailTitle", report.name);
    setDetailText("reportDetailDate", formatDate(report.date));
    setDetailText("reportDetailLocation", report.location);
    setDetailText("reportDetailResponsible", report.responsible);
    setDetailText("reportDetailParticipants", report.participants + " peserta");
    var image = document.querySelector("#reportDetailImage");
    image.src = report.photo;
    image.alt = "Dokumentasi " + report.name;
    image.classList.toggle("report-detail-photo-asrama", report.name === "Pemeriksaan Kebersihan Asrama");
    document.querySelector("#editReportFromDetail").dataset.reportId = report.id;
    detailModal.show();
  };

  var createReportId = function () {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "report-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  };

  document.querySelector("#addReportButton").addEventListener("click", function () {
    openReportForm("");
  });

  reportGrid.addEventListener("click", function (event) {
    var button = event.target.closest("[data-report-action]");
    if (!button) {
      return;
    }

    var reportId = button.dataset.reportId;
    if (button.dataset.reportAction === "detail") {
      openReportDetail(reportId);
    } else if (button.dataset.reportAction === "edit") {
      openReportForm(reportId);
    } else if (button.dataset.reportAction === "delete") {
      var report = reports.find(function (item) {
        return item.id === reportId;
      });
      if (report && window.confirm("Hapus laporan \"" + report.name + "\"? Tindakan ini tidak dapat dibatalkan.")) {
        var remainingReports = reports.filter(function (item) {
          return item.id !== reportId;
        });
        if (saveReports(remainingReports)) {
          showFeedback("Laporan berhasil dihapus.", false);
        }
      }
    }
  });

  document.querySelector("#editReportFromDetail").addEventListener("click", function () {
    var reportId = this.dataset.reportId;
    var openEditorAfterClose = function () {
      detailModalElement.removeEventListener("hidden.bs.modal", openEditorAfterClose);
      openReportForm(reportId);
    };
    detailModalElement.addEventListener("hidden.bs.modal", openEditorAfterClose);
    detailModal.hide();
  });

  typeFilter.addEventListener("change", renderReports);
  monthFilter.addEventListener("change", renderReports);
  dateFilter.addEventListener("change", renderReports);

  photoInput.addEventListener("change", function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) {
      setPhotoProcessing(false);
      return;
    }

    var supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (supportedTypes.indexOf(file.type) === -1) {
      showFormFeedback("Format foto harus JPG, PNG, atau WEBP.", true);
      photoInput.value = "";
      setPhotoProcessing(false);
      if (reportForm.dataset.currentPhoto) {
        setPreview(reportForm.dataset.currentPhoto);
      } else {
        clearPreview();
      }
      return;
    }

    if (file.size > maxUploadBytes) {
      showFormFeedback("Ukuran foto melebihi 4 MB. Pilih foto yang lebih kecil.", true);
      photoInput.value = "";
      setPhotoProcessing(false);
      if (reportForm.dataset.currentPhoto) {
        setPreview(reportForm.dataset.currentPhoto);
      } else {
        clearPreview();
      }
      return;
    }

    clearPreview();
    if (window.URL && typeof window.URL.createObjectURL === "function") {
      previewObjectUrl = URL.createObjectURL(file);
      photoPreview.src = previewObjectUrl;
      photoPreview.classList.remove("d-none");
      photoPlaceholder.classList.add("d-none");
    }
    setPhotoProcessing(true);
    showFormFeedback("Memproses foto...", false);
    var reader = new FileReader();
    reader.onerror = function () {
      setPhotoProcessing(false);
      showFormFeedback("Foto tidak dapat dibaca. Coba pilih file gambar lain.", true);
    };
    reader.onload = function () {
      var image = new Image();
      image.onerror = function () {
        setPhotoProcessing(false);
        showFormFeedback("File yang dipilih bukan gambar yang dapat dibuka.", true);
      };
      image.onload = function () {
        try {
          var maxDimension = 1280;
          var scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          var context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Canvas tidak tersedia.");
          }
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          var optimizedPhoto = canvas.toDataURL("image/jpeg", 0.78);
          if (optimizedPhoto.length > maxStoredPhotoLength) {
            optimizedPhoto = canvas.toDataURL("image/jpeg", 0.62);
          }
          if (optimizedPhoto.length > maxStoredPhotoLength) {
            setPhotoProcessing(false);
            showFormFeedback("Foto masih terlalu besar setelah dioptimalkan. Pilih foto yang lebih kecil.", true);
            photoInput.value = "";
            return;
          }

          reportForm.dataset.currentPhoto = optimizedPhoto;
          setPreview(optimizedPhoto);
          setPhotoProcessing(false);
          showFormFeedback("", false);
        } catch (error) {
          setPhotoProcessing(false);
          showFormFeedback("Foto gagal diproses. Coba pilih file gambar lain.", true);
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  reportForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (isPhotoProcessing) {
      showFormFeedback("Tunggu sampai foto selesai diproses.", true);
      return;
    }
    showFormFeedback("", false);

    if (!reportForm.reportValidity()) {
      return;
    }

    var reportId = document.querySelector("#reportId").value;
    var existingReport = reportId ? reports.find(function (item) {
      return item.id === reportId;
    }) : null;
    var photo = reportForm.dataset.currentPhoto;
    var nextReport = {
      id: reportId || createReportId(),
      name: document.querySelector("#reportName").value.trim(),
      date: document.querySelector("#reportDate").value,
      location: document.querySelector("#reportLocation").value.trim(),
      responsible: document.querySelector("#reportResponsible").value.trim(),
      participants: Number(document.querySelector("#reportParticipants").value),
      status: "Terlaksana",
      photo: photo || (existingReport && existingReport.photo)
    };

    if (!isValidReport(nextReport)) {
      showFormFeedback("Lengkapi semua kolom dan pilih foto dokumentasi yang valid.", true);
      return;
    }

    var nextReports = existingReport
      ? reports.map(function (item) {
        return item.id === reportId ? nextReport : item;
      })
      : reports.concat([nextReport]);

    if (saveReports(nextReports)) {
      resetReportForm();
      formModalElement.classList.add("d-none");
      showFeedback(existingReport ? "Perubahan laporan berhasil disimpan." : "Laporan baru berhasil disimpan.", false);
    }
  });

  document.querySelector("#cancelReportForm").addEventListener("click", function () {
    resetReportForm();
    formModalElement.classList.add("d-none");
  });

  reports = loadReports();
  renderReports();
})();
