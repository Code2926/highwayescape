/* ==========================================================
   SUPPORT PAGE SCRIPT — Highway Escape (v1.2.0)
   Polished + Optimized + Fully Synced with Theme
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('supportForm');
  const submitBtn = document.getElementById('submitBtn');
  const spinner = submitBtn.querySelector('.spinner');
  const btnText = submitBtn.querySelector('.btn-text');
  const customSelect = document.querySelector('.custom-select');
  const selected = customSelect.querySelector('.selected');
  const options = customSelect.querySelector('.options');
  const hiddenIssue = form.querySelector('input[name="issue"]');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('attachments');
  const preview = document.getElementById('preview');
  const modal = document.getElementById('fileModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close-btn');
  let files = [];
  let currentIndex = 0;
  let zoomed = false;

  /* ---------- Custom Select (Stable + Mobile Safe) ---------- */
  (() => {
    const toggleSelect = () => {
      const isOpen = customSelect.classList.contains('open');
      document.querySelectorAll('.custom-select').forEach(sel => {
        sel.classList.remove('open');
        sel.querySelector('.options').style.display = 'none';
      });
      if (!isOpen) {
        customSelect.classList.add('open');
        options.style.display = 'flex';
      }
    };

    customSelect.addEventListener('click', e => {
      e.stopPropagation();
      toggleSelect();
    });

    document.addEventListener('click', e => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
        options.style.display = 'none';
      }
    });

    options.querySelectorAll('div').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        selected.textContent = opt.textContent;
        hiddenIssue.value = opt.dataset.value;
        customSelect.classList.remove('open');
        options.style.display = 'none';
      });
    });

    window.addEventListener('scroll', () => {
      if (customSelect.classList.contains('open')) {
        customSelect.classList.remove('open');
        options.style.display = 'none';
      }
    });
  })();

  /* ---------- Attachments ---------- */
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('hover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('hover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
    dropzone.classList.remove('hover');
  });
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(list) {
    const add = Array.from(list).slice(0, 3 - files.length);
    files.push(...add);
    renderPreviews();
  }

  function renderPreviews() {
    preview.innerHTML = '';
    files.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'preview-item';

      if (f.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = f.name;
        item.appendChild(img);
      } else {
        const txt = document.createElement('span');
        txt.textContent = f.name.split('.').pop().toUpperCase();
        txt.style.fontSize = '0.75rem';
        txt.style.color = '#8fb6c0';
        item.appendChild(txt);
      }

      const view = document.createElement('button');
      view.className = 'view';
      view.textContent = '👁';
      view.onclick = () => viewFile(f, i);
      item.appendChild(view);

      const rm = document.createElement('button');
      rm.className = 'remove';
      rm.textContent = '×';
      rm.onclick = () => {
        files.splice(i, 1);
        renderPreviews();
      };
      item.appendChild(rm);

      preview.appendChild(item);
    });
  }

  /* ---------- Image Preview Modal ---------- */
  function viewFile(file, index) {
    currentIndex = index;
    if (file.type.startsWith('image/')) {
      modalImg.src = URL.createObjectURL(file);
      modal.classList.add('active');
    } else {
      window.open(URL.createObjectURL(file), '_blank');
    }
  }

  closeBtn.addEventListener('click', () => closeModal());
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (modal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    modalImg.src = '';
    zoomed = false;
  }

  modalImg.addEventListener('click', () => {
    zoomed = !zoomed;
    modal.querySelector('.file-modal-content').classList.toggle('zoomed', zoomed);
  });

  function nextImage() {
    if (files.length <= 1) return;
    currentIndex = (currentIndex + 1) % files.length;
    viewFile(files[currentIndex], currentIndex);
  }
  function prevImage() {
    if (files.length <= 1) return;
    currentIndex = (currentIndex - 1 + files.length) % files.length;
    viewFile(files[currentIndex], currentIndex);
  }

  /* ---------- Form Submission ---------- */
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
  const setState = state => {
    submitBtn.classList.remove('loading', 'success', 'error');
    spinner.classList.add('hidden');
    btnText.textContent = 'Submit';
    if (state === 'loading') {
      submitBtn.classList.add('loading');
      btnText.textContent = '';
      spinner.classList.remove('hidden');
    } else if (state === 'success') {
      submitBtn.classList.add('success');
      btnText.textContent = '✔';
    } else if (state === 'error') {
      submitBtn.classList.add('error');
      btnText.textContent = '×';
    }
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      issue: hiddenIssue.value.trim(),
      message: form.message.value.trim()
    };

    if (!data.name || !data.email || !data.issue || !data.message || !validateEmail(data.email)) {
      setState('error');
      setTimeout(() => setState(), 2500);
      return;
    }

    setState('loading');
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    files.forEach(f => fd.append('attachments', f));

    try {
      const res = await fetch('https://formsubmit.co/ajax/codenova.projects@gmail.com', {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        setState('success');
        form.reset();
        files = [];
        preview.innerHTML = '';
        selected.textContent = 'Select Issue Type';
        hiddenIssue.value = '';
      } else throw new Error();
    } catch {
      setState('error');
    } finally {
      setTimeout(() => setState(), 4000);
    }
  });
});
