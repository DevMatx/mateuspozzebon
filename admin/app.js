const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const mediaForm = document.getElementById('mediaForm');
const mediaList = document.getElementById('mediaList');
const template = document.getElementById('mediaItemTemplate');
const loginMessage = document.getElementById('loginMessage');
const formMessage = document.getElementById('formMessage');
const logoutButton = document.getElementById('logoutButton');

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: options.body instanceof FormData ? options.headers : {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

function setSession(isLogged) {
  loginPanel.classList.toggle('hidden', isLogged);
  dashboard.classList.toggle('hidden', !isLogged);
}

function fillSelect(select, value) {
  Array.from(select.options).forEach((option) => {
    option.selected = option.value === value;
  });
}

function renderMedia(media) {
  mediaList.innerHTML = '';

  media.forEach((item) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.media-item');
    const thumb = node.querySelector('.thumb');
    const form = node.querySelector('.edit-form');
    const deleteButton = node.querySelector('.delete-button');

    const mediaNode = document.createElement(item.resourceType === 'video' ? 'video' : 'img');
    mediaNode.src = item.url;
    mediaNode.alt = item.alt || item.title;
    if (item.resourceType === 'video') mediaNode.controls = true;
    thumb.appendChild(mediaNode);

    form.id.value = item._id;
    form.title.value = item.title || '';
    form.alt.value = item.alt || '';
    form.placement.value = (item.placement || []).join(',');
    form.sortOrder.value = item.sortOrder || 0;
    form.isActive.checked = item.isActive;
    fillSelect(form.discipline, item.discipline);
    fillSelect(form.category, item.category);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        title: form.title.value,
        alt: form.alt.value,
        discipline: form.discipline.value,
        category: form.category.value,
        placement: form.placement.value,
        sortOrder: Number(form.sortOrder.value || 0),
        isActive: form.isActive.checked
      };

      await request(`/api/media/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await loadMedia();
    });

    deleteButton.addEventListener('click', async () => {
      if (!confirm(`Excluir "${item.title}"?`)) return;
      await request(`/api/media/${item._id}`, { method: 'DELETE' });
      await loadMedia();
    });

    mediaList.appendChild(article);
  });
}

async function loadMedia() {
  const media = await request('/api/media/admin');
  renderMedia(media);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';

  try {
    const formData = new FormData(loginForm);
    await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });
    setSession(true);
    await loadMedia();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

mediaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = 'Enviando...';
  const submitButton = mediaForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const formData = new FormData(mediaForm);
    const placements = Array.from(mediaForm.querySelectorAll('input[name="placement"]:checked'))
      .map((input) => input.value);
    formData.delete('placement');
    formData.append('placement', placements.join(','));

    await request('/api/media', { method: 'POST', body: formData });
    mediaForm.reset();
    mediaForm.querySelector('input[value="gallery"]').checked = true;
    formMessage.textContent = 'Mídia cadastrada.';
    await loadMedia();
  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

logoutButton.addEventListener('click', async () => {
  await request('/api/auth/logout', { method: 'POST' });
  setSession(false);
});

request('/api/auth/me')
  .then(async () => {
    setSession(true);
    await loadMedia();
  })
  .catch(() => setSession(false));
