(function() {
  const dialog = document.getElementById('report-dialog');
  const form = document.getElementById('report-form');
  const cancelBtn = document.getElementById('report-cancel');
  const submitBtn = document.getElementById('report-submit');
  const statusEl = document.getElementById('report-status');
  const resourceIdEl = document.getElementById('report-resource-id');
  const resourceNameEl = document.getElementById('report-resource-name');
  const issueTypeEl = document.getElementById('report-issue-type');
  const detailsEl = document.getElementById('report-details');
  const emailEl = document.getElementById('report-email');

  if (!dialog || !form) return;

  document.querySelectorAll('.report-issue-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resourceIdEl.value = btn.dataset.resourceId || '';
      resourceNameEl.textContent = btn.dataset.resourceName || '';
      form.reset();
      statusEl.textContent = '';
      dialog.showModal();
    });
  });

  cancelBtn?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.querySelector('.cf-turnstile input[name="cf-turnstile-response"]')?.value || '';
    submitBtn.disabled = true;
    statusEl.textContent = 'Sending…';
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_id: resourceIdEl.value,
          resource_name: resourceNameEl.textContent,
          issue_type: issueTypeEl.value,
          details: detailsEl.value,
          email: emailEl.value,
          turnstile_token: token,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        statusEl.textContent = 'Thanks — your report was received. A real person will review it.';
        statusEl.className = 'text-sm text-center text-green-700';
        setTimeout(() => dialog.close(), 1800);
      } else {
        statusEl.textContent = data.error || 'Something went wrong. Please try again.';
        statusEl.className = 'text-sm text-center text-red-700';
      }
    } catch {
      statusEl.textContent = 'Network error. Please try again.';
      statusEl.className = 'text-sm text-center text-red-700';
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
