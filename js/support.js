/* ==========================================================
   SUPPORT PAGE SCRIPT — Highway Escape (v3.0.0)
   Reliable Web3Forms Integration + Full Feature Retention
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Core Elements
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
  const modalContent = modal ? modal.querySelector('.file-modal-content') : null;
  const modalImg = document.getElementById('modalImage');
  const closeBtn = modal ? modal.querySelector('.close-btn') : null;

  let files = [];
  let currentIndex = 0;
  let zoomed = false;

  /* ----------------------------------------------------------
     Button States
  ---------------------------------------------------------- */
  const setState = (state, text = 'Submit') => {
    submitBtn.classList.remove('loading', 'success', 'error');
    spinner.classList.add('hidden');
    btnText.textContent = text;

    if (state === 'loading') {
      submitBtn.classList.add('loading');
      btnText.textContent = 'Sending...';
      spinner.classList.remove('hidden');
    } else if (state === 'success') {
      submitBtn.classList.add('success');
      btnText.textContent = text;
    } else if (state === 'error') {
      submitBtn.classList.add('error');
      btnText.textContent = text;
    } else {
      btnText.textContent = text;
    }
  };

  /* ----------------------------------------------------------
     Custom Select (same look as inputs)
  ---------------------------------------------------------- */
  (() => {
    const toggle = () => {
      const isOpen = customSelect.classList.contains('open');
      document.querySelectorAll('.custom-select').forEach(s => {
        s.classList.remove('open');
        const opts = s.querySelector('.options');
        if (opts) opts.style.display = 'none';
      });
      if (!isOpen) {
        customSelect.classList.add('open');
        options.style.display = 'flex';
      }
    };

    customSelect.addEventListener('click', e => { e.stopPropagation(); toggle(); });
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
        hiddenIssue.value = opt.dataset.value || '';
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

  /* ----------------------------------------------------------
     Attachments + Preview
  ---------------------------------------------------------- */
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('hover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('hover'));
  dropzone.addEventListener('drop', e => { e.preventDefault(); handleFiles(e.dataTransfer.files); dropzone.classList.remove('hover'); });
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(list) {
    const toAdd = Array.from(list).slice(0, Math.max(0, 3 - files.length)); // Max 3
    toAdd.forEach(f => files.push(f));
    renderPreviews();
  }

  function renderPreviews() {
    preview.innerHTML = '';
    files.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'preview-item';

      if (f.type && f.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = f.name;
        item.appendChild(img);
      } else {
        const label = document.createElement('span');
        label.textContent = (f.name || 'FILE').split('.').pop().toUpperCase();
        label.style.fontSize = '0.75rem';
        label.style.color = '#8fb6c0';
        item.appendChild(label);
      }

      const view = document.createElement('button');
      view.type = 'button';
      view.className = 'view';
      view.innerHTML = '<i class="fas fa-eye"></i>';  // Font Awesome eye icon
      view.addEventListener('click', () => viewFile(f, i));
      item.appendChild(view);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'remove';
      rm.innerHTML = '<i class="fas fa-times"></i>';  // Font Awesome times icon
      rm.addEventListener('click', () => { files.splice(i, 1); renderPreviews(); });
      item.appendChild(rm);

      preview.appendChild(item);
    });
  }

  /* ----------------------------------------------------------
     Image Modal Viewer
  ---------------------------------------------------------- */
  function viewFile(file, index) {
    currentIndex = index;
    if (!modal || !modalImg) {
      window.open(URL.createObjectURL(file), '_blank');
      return;
    }

    if (file.type && file.type.startsWith('image/')) {
      modalImg.src = URL.createObjectURL(file);
      modal.classList.add('active');
      zoomed = false;
      if (modalContent) modalContent.classList.remove('zoomed');
    } else {
      window.open(URL.createObjectURL(file), '_blank');
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    if (modalImg) modalImg.src = '';
    zoomed = false;
    if (modalContent) modalContent.classList.remove('zoomed');
  }

  if (modalImg && modalContent) {
    modalImg.addEventListener('click', () => {
      zoomed = !zoomed;
      modalContent.classList.toggle('zoomed', zoomed);
    });
  }

  /* ----------------------------------------------------------
     Submission (Web3Forms API - Reliable)
  ---------------------------------------------------------- */
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      issue: hiddenIssue.value.trim(),
      message: form.message.value.trim(),
      access_key: 'eea9ee26-98d2-4ca3-b411-c798659404aa'
    };

    if (!data.name || !data.email || !data.issue || !data.message) {
      setState('error', 'Please complete all required fields');
      setTimeout(() => setState(null, 'Submit'), 4000);
      return;
    }

    if (!validateEmail(data.email)) {
      setState('error', 'Please provide a valid email address');
      setTimeout(() => setState(null, 'Submit'), 4000);
      return;
    }

    setState('loading');

    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    files.forEach(f => fd.append('attachments[]', f));

    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const json = await res.json();

      if (json.success) {
        setState('success', 'Message delivered successfully');
        form.reset();
        files = [];
        preview.innerHTML = '';
        selected.textContent = 'Select Issue Type';
        hiddenIssue.value = '';
      } else {
        setState('error', json.message || 'Failed to deliver message');
      }
    } catch (err) {
      if (!navigator.onLine) {
        setState('error', 'No internet connection — please try again when online');
      } else if (err.name === 'AbortError') {
        setState('error', 'Request timed out — please try again');
      } else {
        setState('error', 'Network or server error — please try again');
      }
    } finally {
      setTimeout(() => setState(null, 'Submit'), 5000);
    }
  });
});
