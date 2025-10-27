// support.js — upgraded upload flow (copy/paste replace)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("supportForm");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = submitBtn.querySelector(".spinner");
  const btnText = submitBtn.querySelector(".btn-text");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("attachments");
  const preview = document.getElementById("preview");
  const customSelect = document.querySelector(".custom-select");
  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelector(".options");
  const hiddenIssue = form.querySelector('input[name="issue"]');
  const uploadWrapper = document.getElementById("uploadWrapper");

  // Modal
  const fileModal = document.getElementById("fileModal");
  const modalImage = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");

  const IMGBB_KEY = "3eff9ef62e4a275a2380768fecf84bc3";
  // file objects: { id, file, url (objectURL), canceled, uploading, uploadedUrl }
  let files = [];
  let uploading = false;

  // ------------------- UI State -------------------
  const setState = (state, text = "Submit") => {
    submitBtn.classList.remove("loading", "success", "error");
    spinner.classList.add("hidden");
    btnText.textContent = text;
    if (state === "loading") {
      submitBtn.classList.add("loading");
      spinner.classList.remove("hidden");
    } else if (state === "success") submitBtn.classList.add("success");
    else if (state === "error") submitBtn.classList.add("error");
  };

  // ------------------- Custom Select -------------------
  (() => {
    const toggle = () => {
      const isOpen = customSelect.classList.contains("open");
      document.querySelectorAll(".custom-select").forEach((s) => {
        s.classList.remove("open");
        s.querySelector(".options").style.display = "none";
      });
      if (!isOpen) {
        customSelect.classList.add("open");
        options.style.display = "flex";
      }
    };
    customSelect.addEventListener("click", (e) => { e.stopPropagation(); toggle(); });
    document.addEventListener("click", (e) => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove("open");
        options.style.display = "none";
      }
    });
    options.querySelectorAll("div").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        selected.textContent = opt.textContent;
        hiddenIssue.value = opt.dataset.value || "";
        customSelect.classList.remove("open");
        options.style.display = "none";
      });
    });
  })();

  // ------------------- File Input / Dropzone -------------------
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("hover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("hover"));
  dropzone.addEventListener("drop", (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); dropzone.classList.remove("hover"); });
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

  function handleFiles(list) {
    const incoming = Array.from(list);
    for (const f of incoming) {
      if (files.length >= 4) break;
      if (!f.type?.startsWith("image/")) continue;
      const id = `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      const objectUrl = URL.createObjectURL(f);
      files.push({ id, file: f, url: objectUrl, canceled: false, uploading: false, uploadedUrl: null });
    }
    renderPreviews();
  }

  // ------------------- Render Thumbnails -------------------
  function renderPreviews() {
    preview.innerHTML = "";
    uploadWrapper.innerHTML = "";

    // ensure thumbnails are at most 3 in a row — CSS handles wrapping; this just renders them
    files.forEach((fObj, i) => {
      const item = document.createElement("div");
      item.className = "upload-preview-item";
      item.dataset.id = fObj.id;

      const img = document.createElement("img");
      img.src = fObj.url; // show local preview immediately
      img.alt = fObj.file.name || "attachment";
      item.appendChild(img);

      // progress bar (bottom stripe)
      const progressContainer = document.createElement("div");
      progressContainer.className = "upload-progress";
      progressContainer.innerHTML = `<div class="bar"></div>`;
      item.appendChild(progressContainer);

      // view button (open modal, show full image)
      const view = document.createElement("button");
      view.type = "button";
      view.className = "view";
      view.innerHTML = '<i class="fas fa-eye"></i>';
      view.title = "Preview";
      view.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        // if uploadedUrl exists use it, else use object url (local)
        modalImage.src = fObj.uploadedUrl || fObj.url;
        fileModal.classList.add("open");
      });
      item.appendChild(view);

      // remove button (cancel)
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.innerHTML = '<i class="fas fa-times"></i>';
      remove.title = "Remove";
      remove.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        // if uploading, mark canceled so upload routine can skip it
        fObj.canceled = true;
        // revoke objectURL
        try { URL.revokeObjectURL(fObj.url); } catch (e) {}
        files = files.filter(x => x.id !== fObj.id);
        renderPreviews();
      });
      item.appendChild(remove);

      preview.appendChild(item);
    });
  }

  // ------------------- Modal handlers -------------------
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      fileModal.classList.remove("open");
      modalImage.src = "";
    });
  }
  // close modal when clicking outside content
  fileModal.addEventListener("click", (e) => {
    if (e.target === fileModal) {
      fileModal.classList.remove("open");
      modalImage.src = "";
    }
  });

  // ------------------- Compress Image helper -------------------
  async function compressImage(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) return resolve(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 1280;
        const scale = Math.min(maxW / img.width, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type, 0.8);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  // ------------------- Upload single file to ImgBB (with fake progress) -------------------
  async function uploadToImgBB(fObj) {
    // if canceled before starting, skip
    if (fObj.canceled) return null;

    const item = preview.querySelector(`[data-id="${fObj.id}"]`);
    if (!item) return null; // removed
    const barEl = item.querySelector(".bar");
    if (!barEl) return null;

    fObj.uploading = true;
    submitBtn.disabled = true;

    // reset bar
    barEl.style.width = "0%";
    barEl.classList.remove("done");
    // compress first
    const fastFile = await compressImage(fObj.file);

    // read file to base64
    const reader = new FileReader();
    reader.readAsDataURL(fastFile);

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        // if canceled after read started
        if (fObj.canceled) { fObj.uploading = false; return resolve(null); }

        const fd = new FormData();
        fd.append("key", IMGBB_KEY);
        fd.append("image", reader.result.split(",")[1]);

        // fake progress animation (fills to 85-90% while waiting)
        let fake = 0;
        const fakeInterval = setInterval(() => {
          fake = Math.min(fake + (3 + Math.random() * 6), 90);
          barEl.style.width = `${fake}%`;
        }, 150);

        try {
          const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: fd });
          clearInterval(fakeInterval);
          const json = await res.json();

          if (!json || !json.success) {
            barEl.style.background = "#ff4d4d";
            fObj.uploading = false;
            return reject(json || new Error("Upload failed"));
          }

          // if user canceled while we were uploading, revoke and ignore result
          if (fObj.canceled) {
            fObj.uploading = false;
            return resolve(null);
          }

          // success: show 100%
          barEl.style.width = "100%";
          barEl.classList.add("done");
          fObj.uploading = false;
          fObj.uploadedUrl = json.data.display_url || json.data.url || null;

          // replace thumbnail with the remote hosted image for a cleaner preview (optional)
          const itemImg = item.querySelector("img");
          if (itemImg && fObj.uploadedUrl) itemImg.src = fObj.uploadedUrl;

          resolve(fObj.uploadedUrl);
        } catch (err) {
          clearInterval(fakeInterval);
          barEl.style.background = "#ff4d4d";
          fObj.uploading = false;
          reject(err);
        }
      };

      reader.onerror = (err) => {
        fObj.uploading = false;
        reject(err);
      };
    });
  }

  // ------------------- Upload ALL (sequential) and return links (skips canceled) -------------------
  async function uploadFilesAndGetLinks() {
    if (files.length === 0) return [];
    uploading = true;
    const links = [];
    for (const fObj of files.slice()) {
      // skip canceled ones
      if (fObj.canceled) continue;
      try {
        const link = await uploadToImgBB(fObj);
        if (link) links.push(link);
      } catch (err) {
        console.error("upload error for", fObj.file.name, err);
        // continue with remaining files
      }
    }
    uploading = false;
    uploadWrapper.innerHTML = `<p class="upload-info" style="color:#00ffaa">All files uploaded ✓</p>`;
    submitBtn.disabled = false;
    return links;
  }

  // ------------------- Email / Submit -------------------
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // basic validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const issue = hiddenIssue.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !issue || !message) {
      setState("error", "Please complete all fields");
      return setTimeout(() => setState(null, "Submit"), 3000);
    }
    if (!validateEmail(email)) {
      setState("error", "Invalid email format");
      return setTimeout(() => setState(null, "Submit"), 3000);
    }
    if (uploading) {
      setState("error", "Uploads in progress — please wait");
      return setTimeout(() => setState(null, "Submit"), 3000);
    }

    // start flow
    setState("loading", files.length > 0 ? "Uploading Files..." : "Sending...");
    submitBtn.disabled = true;

    let uploadedLinks = [];
    if (files.length > 0) {
      try {
        uploadedLinks = await uploadFilesAndGetLinks();
      } catch (err) {
        console.error("Error uploading files", err);
      }
    }

    setState("loading", "Finalizing...");

    // build a clean HTML body with embedded image links
    let htmlBody = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Issue:</strong> ${escapeHtml(issue)}</p>
      <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    if (uploadedLinks.length > 0) {
      htmlBody += `<hr><p><strong>Attached Files:</strong><br>`;
      uploadedLinks.forEach((l, idx) => {
        htmlBody += `<a href="${l}" target="_blank" rel="noopener noreferrer">Attachment ${idx + 1}</a><br>`;
      });
      htmlBody += `</p>`;
    }

    const fd = new FormData();
    fd.append("access_key", "eea9ee26-98d2-4ca3-b411-c798659404aa");
    fd.append("subject", `Support Request: ${issue}`);
    fd.append("from_name", name);
    fd.append("from_email", email);
    fd.append("html", htmlBody);
    fd.append("message", message);

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      const json = await res.json();

      if (json && json.success) {
        setState("success", "Message delivered");
        // cleanup
        form.reset();
        // revoke object URLs
        files.forEach(f => { try { URL.revokeObjectURL(f.url); } catch(e){} });
        files = [];
        preview.innerHTML = "";
        uploadWrapper.innerHTML = "";
        selected.textContent = "Select Issue Type";
        hiddenIssue.value = "";
      } else {
        setState("error", (json && json.message) || "Failed to deliver");
      }
    } catch (err) {
      console.error("web3forms error", err);
      setState("error", "Network or server error — please try again");
    } finally {
      submitBtn.disabled = false;
      setTimeout(() => setState(null, "Submit"), 4000);
    }
  });

  // small helper to escape HTML in user input for the email body
  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // keyboard accessibility: press Esc to close modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (fileModal.classList.contains("open")) {
        fileModal.classList.remove("open");
        modalImage.src = "";
      }
    }
  });

  // initial render (in case there are preloaded files)
  renderPreviews();
});
