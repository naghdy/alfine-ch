// Contact form: client-side validation, honeypot check and an AJAX submit to
// the form service with clear success and error states. Without JavaScript the
// form still posts normally to the same endpoint.

const form = document.querySelector('[data-contact-form]');
if (!form) return;

const alertBox = form.querySelector('[data-form-alert]');
const errorBox = form.querySelector('[data-form-error]');
const submit = form.querySelector('[data-submit]');
const success = form.parentElement.querySelector('[data-form-success]');
const submitLabel = submit.textContent;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// We validate ourselves so messages match the page language.
form.setAttribute('novalidate', '');

const rules = {
  name: (v) => v.trim().length > 0,
  email: (v) => emailPattern.test(v.trim()),
  message: (v) => v.trim().length > 0,
};

const setFieldError = (name, invalid) => {
  const input = form.elements[name];
  const message = form.querySelector(`[data-error-for="${name}"]`);
  input.setAttribute('aria-invalid', String(invalid));
  message.hidden = !invalid;
  if (invalid) input.setAttribute('aria-describedby', message.id);
  else input.removeAttribute('aria-describedby');
};

const validate = () => {
  let firstInvalid = null;
  for (const [name, isValid] of Object.entries(rules)) {
    const ok = isValid(form.elements[name].value);
    setFieldError(name, !ok);
    if (!ok && !firstInvalid) firstInvalid = form.elements[name];
  }
  return firstInvalid;
};

// Re-check a field once the visitor corrects it.
for (const name of Object.keys(rules)) {
  form.elements[name].addEventListener('input', () => {
    if (form.elements[name].getAttribute('aria-invalid') === 'true') {
      setFieldError(name, !rules[name](form.elements[name].value));
    }
  });
}

const setBusy = (busy) => {
  submit.disabled = busy;
  submit.textContent = busy ? form.dataset.sendingLabel : submitLabel;
  form.setAttribute('aria-busy', String(busy));
};

const showError = () => {
  errorBox.hidden = false;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  alertBox.hidden = true;
  errorBox.hidden = true;

  const firstInvalid = validate();
  if (firstInvalid) {
    alertBox.hidden = false;
    firstInvalid.focus();
    return;
  }

  // Bots tend to fill every field; quietly drop those submissions.
  if (form.elements._gotcha.value) {
    form.hidden = true;
    success.hidden = false;
    return;
  }

  if (form.dataset.configured !== 'true') {
    showError();
    return;
  }

  const data = new FormData(form);
  if (!String(data.get('subject') || '').trim()) data.set('subject', form.dataset.defaultSubject);

  setBusy(true);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Form service responded ${response.status}`);
    form.reset();
    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch {
    showError();
  } finally {
    setBusy(false);
  }
});
