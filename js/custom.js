
  (function ($) {
  
  "use strict";

    // AOS ANIMATIONS
    AOS.init();

    // ABOUT PHOTO CAROUSEL
    var aboutPhotoCarousel = document.querySelector("#aboutPhotoCarousel");

    if (aboutPhotoCarousel) {
      var aboutPhotoCarouselInstance = new bootstrap.Carousel(aboutPhotoCarousel, {
        interval: 5000,
        ride: "carousel"
      });
      aboutPhotoCarouselInstance.cycle();
    }

    // HERO LOGO LIGHTING
    var heroLogo = document.querySelector(".hero-logo");
    var supportsFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (heroLogo && supportsFinePointer && !prefersReducedMotion) {
      heroLogo.addEventListener("pointermove", function (event) {
        var bounds = heroLogo.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width;
        var y = (event.clientY - bounds.top) / bounds.height;

        heroLogo.style.setProperty("--light-x", (x * 100) + "%");
        heroLogo.style.setProperty("--light-y", (y * 100) + "%");
        heroLogo.style.setProperty("--pointer-yaw", ((x - 0.5) * 10) + "deg");
        heroLogo.style.setProperty("--pointer-pitch", ((0.5 - y) * 8) + "deg");
      });

      heroLogo.addEventListener("pointerleave", function () {
        heroLogo.style.setProperty("--light-x", "50%");
        heroLogo.style.setProperty("--light-y", "45%");
        heroLogo.style.setProperty("--pointer-yaw", "0deg");
        heroLogo.style.setProperty("--pointer-pitch", "0deg");
      });
    }

    // PROGRAM & JADWAL TABS
    var programTabs = document.querySelectorAll(".program-menu-button");
    var programPanels = document.querySelectorAll(".program-panel");

    var selectProgramTab = function (tab) {
      var selectedPanel = tab.dataset.programTab;

      programTabs.forEach(function (item) {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });

      programPanels.forEach(function (panel) {
        panel.classList.toggle("d-none", panel.dataset.programPanel !== selectedPanel);
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
    };

    if (programTabs.length && programPanels.length) {
      programTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          selectProgramTab(tab);
        });
      });

      document.querySelectorAll("[data-inventory-shortcut]").forEach(function (shortcut) {
        shortcut.addEventListener("click", function () {
          var inventoryTab = document.querySelector('[data-program-tab="inventaris"]');
          if (inventoryTab) {
            selectProgramTab(inventoryTab);
          }
        });
      });
    }

    // INVENTORY LOAN TRACKING
    var inventoryForm = document.querySelector("#inventoryForm");
    var inventoryRecordsElement = document.querySelector("#inventoryRecords");

    if (inventoryForm && inventoryRecordsElement) {
      var inventoryStorageKey = "kilassantri-inventory-loans";
      var inventoryTools = [
        { name: "Sapu lidi", quantity: 10 },
        { name: "Sapu lantai", quantity: 10 },
        { name: "Pel lantai", quantity: 10 },
        { name: "Pembersih serawang", quantity: 10 }
      ];
      var legacyInventoryTools = inventoryTools.slice(0, 3);
      var previousSerawangName = "Alat pembersih serawang";
      var inventoryFeedback = document.querySelector("#inventoryFeedback");
      var inventorySummary = document.querySelector("#inventorySummary");
      var inventoryToolSelect = document.querySelector("#borrowedTool");
      var inventoryQuantityInput = document.querySelector("#borrowedQuantity");
      var inventoryAvailableNote = document.querySelector("#inventoryAvailable");
      var inventoryRecords = inventoryTools.map(function (tool) {
        return { tool: tool.name, quantity: tool.quantity, loans: [] };
      });
      var inventoryStorageReady = true;

      var findStoredInventoryRecord = function (data, tool) {
        return data.find(function (item) {
          return item && (
            item.tool === tool.name ||
            (tool.name === "Pembersih serawang" && item.tool === previousSerawangName)
          );
        });
      };

      var isValidLegacyInventoryData = function (data) {
        if (!Array.isArray(data) ||
          (data.length !== legacyInventoryTools.length && data.length !== inventoryTools.length)) {
          return false;
        }

        var toolsToValidate = data.length === inventoryTools.length ? inventoryTools : legacyInventoryTools;
        return toolsToValidate.every(function (tool) {
          var record = findStoredInventoryRecord(data, tool);
          return record &&
            typeof record.borrower === "string" &&
            typeof record.borrowed === "boolean" &&
            (!record.borrowed || record.borrower.trim().length > 0);
        });
      };

      var isValidInventoryData = function (data) {
        return Array.isArray(data) &&
          data.length === inventoryTools.length &&
          inventoryTools.every(function (tool) {
            var record = findStoredInventoryRecord(data, tool);
            if (!record || !Array.isArray(record.loans) ||
              (record.quantity !== undefined &&
                (!Number.isInteger(record.quantity) || record.quantity < 1))) {
              return false;
            }

            var borrowedQuantity = record.loans.reduce(function (total, loan) {
              return total + (loan && Number.isInteger(loan.quantity) ? loan.quantity : 0);
            }, 0);
            return record.loans.every(function (loan) {
              return loan &&
                typeof loan.borrower === "string" &&
                loan.borrower.trim().length > 0 &&
                Number.isInteger(loan.quantity) &&
                loan.quantity > 0;
            }) && (!Number.isInteger(record.quantity) || record.quantity >= borrowedQuantity);
          });
      };

      var showInventoryFeedback = function (message, isError) {
        inventoryFeedback.textContent = message;
        inventoryFeedback.classList.toggle("is-error", Boolean(isError));
      };

      var saveInventoryRecords = function (nextRecords) {
        try {
          localStorage.setItem(inventoryStorageKey, JSON.stringify(nextRecords));
          inventoryRecords = nextRecords;
          return true;
        } catch (error) {
          showInventoryFeedback("Data tidak dapat disimpan di browser ini. Periksa pengaturan penyimpanan browser.", true);
          return false;
        }
      };

      var renderInventoryRecords = function () {
        inventoryRecordsElement.replaceChildren();
        var totalQuantity = inventoryTools.reduce(function (total, tool) {
          var record = inventoryRecords.find(function (item) {
            return item.tool === tool.name;
          });
          return total + record.quantity;
        }, 0);
        var borrowedQuantity = inventoryRecords.reduce(function (total, record) {
          return total + record.loans.reduce(function (toolTotal, loan) {
            return toolTotal + loan.quantity;
          }, 0);
        }, 0);
        inventorySummary.textContent = borrowedQuantity + " dari " + totalQuantity + " unit sedang dipinjam; " + (totalQuantity - borrowedQuantity) + " tersedia.";

        inventoryRecords.forEach(function (record) {
          var toolBorrowedQuantity = record.loans.reduce(function (total, loan) {
            return total + loan.quantity;
          }, 0);
          var stockQuantity = record.quantity;
          var availableQuantity = stockQuantity - toolBorrowedQuantity;
          var row = document.createElement("tr");
          var toolCell = document.createElement("td");
          var totalCell = document.createElement("td");
          var borrowedCell = document.createElement("td");
          var availableCell = document.createElement("td");
          var borrowerCell = document.createElement("td");
          var actionCell = document.createElement("td");

          toolCell.textContent = record.tool;
          totalCell.textContent = stockQuantity + " unit";
          borrowedCell.textContent = toolBorrowedQuantity + " unit";
          var availableStatus = document.createElement("span");
          availableStatus.className = "inventory-status " + (availableQuantity > 0 ? "inventory-status-available" : "inventory-status-borrowed");
          availableStatus.textContent = availableQuantity + " unit";
          availableCell.appendChild(availableStatus);

          if (record.loans.length) {
            var borrowerList = document.createElement("div");
            borrowerList.className = "inventory-borrower-list";
            var actionList = document.createElement("div");
            actionList.className = "inventory-action-list";

            record.loans.forEach(function (loan, index) {
              var borrowerEntry = document.createElement("span");
              borrowerEntry.className = "inventory-borrower-entry";
              borrowerEntry.textContent = loan.borrower + " (" + loan.quantity + " unit)";
              borrowerList.appendChild(borrowerEntry);

              var returnButton = document.createElement("button");
              returnButton.className = "inventory-return-button";
              returnButton.type = "button";
              returnButton.dataset.returnTool = record.tool;
              returnButton.dataset.returnIndex = String(index);
              returnButton.textContent = "Kembalikan " + loan.quantity + " unit";
              actionList.appendChild(returnButton);
            });

            borrowerCell.appendChild(borrowerList);
            actionCell.appendChild(actionList);
          } else {
            borrowerCell.textContent = "—";
            actionCell.textContent = "—";
          }

          row.appendChild(toolCell);
          row.appendChild(totalCell);
          row.appendChild(borrowedCell);
          row.appendChild(availableCell);
          row.appendChild(borrowerCell);
          row.appendChild(actionCell);
          inventoryRecordsElement.appendChild(row);
        });

        Array.prototype.forEach.call(inventoryToolSelect.options, function (option) {
          if (option.value) {
            var record = inventoryRecords.find(function (item) {
              return item.tool === option.value;
            });
            var borrowed = record.loans.reduce(function (total, loan) {
              return total + loan.quantity;
            }, 0);
            var available = record.quantity - borrowed;
            option.disabled = available === 0;
            option.textContent = option.value + " (Tersedia: " + available + ")";
          }
        });

        updateInventoryQuantityLimit();
      };

      var updateInventoryQuantityLimit = function () {
        var selectedRecord = inventoryRecords.find(function (record) {
          return record.tool === inventoryToolSelect.value;
        });
        var toolDefinition = inventoryTools.find(function (tool) {
          return tool.name === inventoryToolSelect.value;
        });

        if (!selectedRecord || !toolDefinition) {
          inventoryQuantityInput.disabled = true;
          inventoryQuantityInput.value = "1";
          inventoryQuantityInput.removeAttribute("max");
          inventoryAvailableNote.textContent = "Stok tersedia akan tampil setelah memilih alat.";
          return;
        }

        var borrowed = selectedRecord.loans.reduce(function (total, loan) {
          return total + loan.quantity;
        }, 0);
        var available = selectedRecord.quantity - borrowed;
        inventoryQuantityInput.disabled = available === 0;
        inventoryQuantityInput.max = String(available);
        inventoryAvailableNote.textContent = "Stok tersedia: " + available + " dari " + selectedRecord.quantity + " unit.";
        if (Number(inventoryQuantityInput.value) > available) {
          inventoryQuantityInput.value = String(available || 1);
        }
      };

      try {
        var savedInventoryRecords = localStorage.getItem(inventoryStorageKey);
        if (savedInventoryRecords !== null) {
          var parsedInventoryRecords = JSON.parse(savedInventoryRecords);
          if (isValidInventoryData(parsedInventoryRecords)) {
            inventoryRecords = inventoryTools.map(function (tool) {
              var savedRecord = findStoredInventoryRecord(parsedInventoryRecords, tool);
              var borrowedQuantity = savedRecord.loans.reduce(function (total, loan) {
                return total + loan.quantity;
              }, 0);
              return {
                tool: tool.name,
                quantity: Math.max(tool.quantity, savedRecord.quantity || 0, borrowedQuantity),
                loans: savedRecord.loans
              };
            });
          } else if (isValidLegacyInventoryData(parsedInventoryRecords)) {
            var migratedInventoryRecords = inventoryTools.map(function (tool) {
              var legacyRecord = findStoredInventoryRecord(parsedInventoryRecords, tool);
              return {
                tool: tool.name,
                quantity: tool.quantity,
                loans: legacyRecord && legacyRecord.borrowed
                  ? [{ borrower: legacyRecord.borrower, quantity: 1 }]
                  : []
              };
            });
            inventoryRecords = migratedInventoryRecords;
          } else {
            throw new Error("Data inventaris tersimpan tidak valid.");
          }
          localStorage.setItem(inventoryStorageKey, JSON.stringify(inventoryRecords));
        }
      } catch (error) {
        inventoryStorageReady = false;
        inventoryForm.querySelectorAll("input, select, button").forEach(function (control) {
          control.disabled = true;
        });
        showInventoryFeedback("Data inventaris tidak dapat dibaca. Penyimpanan browser mungkin diblokir atau datanya rusak.", true);
      }

      renderInventoryRecords();
      inventoryToolSelect.addEventListener("change", updateInventoryQuantityLimit);

      inventoryForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!inventoryStorageReady) {
          return;
        }

        var borrower = document.querySelector("#borrowerName").value.trim();
        var selectedTool = inventoryToolSelect.value;
        var quantity = Number(inventoryQuantityInput.value);
        var selectedRecord = inventoryRecords.find(function (record) {
          return record.tool === selectedTool;
        });
        var toolDefinition = inventoryTools.find(function (tool) {
          return tool.name === selectedTool;
        });

        if (!borrower || !selectedRecord || !toolDefinition || !Number.isInteger(quantity) || quantity < 1) {
          showInventoryFeedback("Isi nama peminjam, pilih alat, dan masukkan jumlah yang valid.", true);
          return;
        }

        var borrowedQuantity = selectedRecord.loans.reduce(function (total, loan) {
          return total + loan.quantity;
        }, 0);
        var availableQuantity = selectedRecord.quantity - borrowedQuantity;
        if (quantity > availableQuantity) {
          showInventoryFeedback("Jumlah melebihi stok tersedia (" + availableQuantity + " biji).", true);
          return;
        }

        var nextRecords = inventoryRecords.map(function (record) {
          return record.tool === selectedTool
            ? {
              tool: record.tool,
              quantity: record.quantity,
              loans: record.loans.concat([{ borrower: borrower, quantity: quantity }])
            }
            : record;
        });

        if (saveInventoryRecords(nextRecords)) {
          inventoryForm.reset();
          renderInventoryRecords();
          showInventoryFeedback("Peminjaman " + quantity + " unit " + selectedTool + " oleh " + borrower + " berhasil dicatat.", false);
        }
      });

      inventoryRecordsElement.addEventListener("click", function (event) {
        var returnButton = event.target.closest("[data-return-tool][data-return-index]");
        if (!returnButton || !inventoryStorageReady) {
          return;
        }

        var selectedTool = returnButton.dataset.returnTool;
        var loanIndex = Number(returnButton.dataset.returnIndex);
        var selectedRecord = inventoryRecords.find(function (record) {
          return record.tool === selectedTool;
        });
        var toolDefinition = inventoryTools.find(function (tool) {
          return tool.name === selectedTool;
        });
        if (!selectedRecord || !toolDefinition || !Number.isInteger(loanIndex) || !selectedRecord.loans[loanIndex]) {
          return;
        }

        var returnedLoan = selectedRecord.loans[loanIndex];
        var nextRecords = inventoryRecords.map(function (record) {
          if (record.tool === selectedTool) {
            var remainingLoans = record.loans.filter(function (loan, index) {
              return index !== loanIndex;
            });
            var remainingQuantity = remainingLoans.reduce(function (total, loan) {
              return total + loan.quantity;
            }, 0);
            return {
              tool: record.tool,
              quantity: remainingLoans.length
                ? Math.max(toolDefinition.quantity, remainingQuantity)
                : toolDefinition.quantity,
              loans: remainingLoans
            };
          }
          return record;
        });

        if (saveInventoryRecords(nextRecords)) {
          renderInventoryRecords();
          showInventoryFeedback(returnedLoan.quantity + " unit " + selectedTool + " dari " + returnedLoan.borrower + " ditandai sudah dikembalikan.", false);
        }
      });
    }

    // NEWS IMAGE RESIZE
    function NewsImageResize(){
      $(".navbar").scrollspy({ offset: -76 });
      
      var LargeImage = $('.large-news-image').height();

      var MinusHeight = LargeImage - 6;

      $('.news-two-column').css({'height' : (MinusHeight - LargeImage / 2) + 'px'});
    }

    $(window).on("resize", NewsImageResize);
    $(document).on("ready", NewsImageResize);

    $('a[href*="#"]').click(function (event) {
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top - 66
          }, 1000);
        }
      }
    });
    
  })(window.jQuery);

  
