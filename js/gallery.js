document.addEventListener('DOMContentLoaded', () => {
  /* ─── CURSOR ─── */
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animCursor() {
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
  document.querySelectorAll('a, button, .filter-button, .gallery-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cur.classList.add('clickable');
    });
    el.addEventListener('mouseleave', () => {
      cur.classList.remove('clickable');
    });
  });

  const disciplineButtons = Array.from(document.querySelectorAll('#disciplineFilters .filter-button'));
  const categoryButtons = Array.from(document.querySelectorAll('#categoryFilters .filter-button'));
  const mediaTypeButtons = Array.from(document.querySelectorAll('#mediaTypeFilters .filter-button'));
  const galleryGrid = document.getElementById('galleryGrid');

  let activeDiscipline = 'all';
  let activeCategory = 'all';
  let activeMediaType = 'all';

  function updateActiveButton(buttons, activeButton) {
    buttons.forEach(button => {
      button.classList.toggle('active', button === activeButton);
    });
  }

  function getCardMediaItems(card) {
    const multiMediaContainer = card.querySelector('.gallery-card-images');
    if (multiMediaContainer) {
      return Array.from(multiMediaContainer.querySelectorAll('img, video'));
    }

    const preview = card.querySelector('.media-preview');
    if (!preview) return [];
    return Array.from(preview.querySelectorAll('img, video'));
  }

  function cloneMediaNode(media) {
    const cloned = media.cloneNode(true);
    if (cloned.tagName === 'VIDEO') {
      cloned.removeAttribute('autoplay');
      cloned.removeAttribute('muted');
      cloned.removeAttribute('loop');
      cloned.controls = true;
      cloned.playsInline = true;
    }
    return cloned;
  }

  function buildHeroCarousel() {
    const heroMedia = document.querySelector('.hero-card-media img');
    const heroImageSources = Array.from(galleryGrid.querySelectorAll('img')).filter(img => {
      // Ensure it's not inside a video preview or something, but since hero is photo-only, just filter images
      return true; // All images are photos
    }).map(img => ({ src: img.src, alt: img.alt || 'Foto da galeria' }));
    if (!heroMedia || heroImageSources.length === 0) return;

    let currentHeroIndex = 0;

    function updateHeroImage() {
      const nextImage = heroImageSources[currentHeroIndex];
      heroMedia.src = nextImage.src;
      heroMedia.alt = nextImage.alt;
    }

    updateHeroImage();
    setInterval(() => {
      currentHeroIndex = (currentHeroIndex + 1) % heroImageSources.length;
      updateHeroImage();
    }, 3500);
  }

  function buildCarousels() {
    const galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-card:not(.carousel-card)'));
    const groups = new Map();

    galleryItems.forEach(item => {
      const title = item.querySelector('h3')?.textContent.trim() || '';
      const mediaItems = getCardMediaItems(item);
      const mediaType = mediaItems.length > 0 ? mediaItems[0].tagName.toLowerCase() : 'photo'; // default to photo if no media
      const groupKey = `${title}|${mediaType}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(item);
    });

    groups.forEach((items, groupKey) => {
      if (items.length <= 1) return;

      const [title, mediaType] = groupKey.split('|');
      const firstItem = items[0];
      const labelText = firstItem.querySelector('.gallery-label')?.textContent || '';

      const wrapper = document.createElement('article');
      wrapper.className = 'gallery-card carousel-card';
      wrapper.dataset.discipline = firstItem.dataset.discipline;
      wrapper.dataset.category = firstItem.dataset.category;

      const carouselVisual = document.createElement('div');
      carouselVisual.className = 'carousel-visual';

      const slidesWrapper = document.createElement('div');
      slidesWrapper.className = 'carousel-slides';

      items.forEach(item => {
        const mediaItems = getCardMediaItems(item);
        mediaItems.forEach(media => {
          const slide = document.createElement('div');
          slide.className = 'carousel-slide';

          const mediaPreview = document.createElement('div');
          mediaPreview.className = `media-preview media-preview--${media.tagName.toLowerCase()}`;
          mediaPreview.appendChild(cloneMediaNode(media));

          slide.appendChild(mediaPreview);
          slidesWrapper.appendChild(slide);
        });
      });

      carouselVisual.appendChild(slidesWrapper);

      const prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'carousel-control carousel-prev';
      prevButton.setAttribute('aria-label', 'Foto anterior');
      prevButton.textContent = '‹';

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'carousel-control carousel-next';
      nextButton.setAttribute('aria-label', 'Próxima foto');
      nextButton.textContent = '›';

      carouselVisual.appendChild(prevButton);
      carouselVisual.appendChild(nextButton);
      wrapper.appendChild(carouselVisual);

      const body = document.createElement('div');
      body.className = 'gallery-card-body';
      body.innerHTML = `<span class="gallery-label">${labelText}</span><h3>${title}</h3>`;
      wrapper.appendChild(body);

      const insertBeforeNode = Array.from(galleryGrid.children).find(node => node === firstItem);
      if (insertBeforeNode) {
        galleryGrid.insertBefore(wrapper, insertBeforeNode);
      } else {
        galleryGrid.appendChild(wrapper);
      }

      items.forEach(item => item.remove());

      let currentIndex = 0;
      const maxIndex = slidesWrapper.children.length - 1;

      function updateCarousel() {
        slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === maxIndex;
      }

      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          updateCarousel();
        }
      });

      nextButton.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
          currentIndex += 1;
          updateCarousel();
        }
      });

      updateCarousel();
    });
  }

  function convertMultiImageCards() {
    const cards = Array.from(galleryGrid.querySelectorAll('.gallery-card:not(.carousel-card)'));

    cards.forEach(card => {
      const mediaElements = Array.from(card.querySelectorAll('img, video'));
      if (mediaElements.length <= 1) return;

      const mediaType = mediaElements[0].tagName.toLowerCase();
      const labelText = card.querySelector('.gallery-label')?.textContent || '';
      const title = card.querySelector('h3')?.textContent.trim() || '';
      const discipline = card.dataset.discipline;
      const category = card.dataset.category;

      const wrapper = document.createElement('article');
      wrapper.className = 'gallery-card carousel-card';
      wrapper.dataset.discipline = discipline;
      wrapper.dataset.category = category;

      const carouselVisual = document.createElement('div');
      carouselVisual.className = 'carousel-visual';

      const slidesWrapper = document.createElement('div');
      slidesWrapper.className = 'carousel-slides';

      mediaElements.forEach(media => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';

        const mediaPreview = document.createElement('div');
        mediaPreview.className = `media-preview media-preview--${media.tagName.toLowerCase()}`;
        mediaPreview.appendChild(cloneMediaNode(media));

        slide.appendChild(mediaPreview);
        slidesWrapper.appendChild(slide);
      });

      carouselVisual.appendChild(slidesWrapper);

      const prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'carousel-control carousel-prev';
      prevButton.setAttribute('aria-label', 'Mídia anterior');
      prevButton.textContent = '‹';

      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'carousel-control carousel-next';
      nextButton.setAttribute('aria-label', 'Próxima mídia');
      nextButton.textContent = '›';

      carouselVisual.appendChild(prevButton);
      carouselVisual.appendChild(nextButton);
      wrapper.appendChild(carouselVisual);

      const body = document.createElement('div');
      body.className = 'gallery-card-body';
      body.innerHTML = `<span class="gallery-label">${labelText}</span><h3>${title}</h3>`;
      wrapper.appendChild(body);

      card.replaceWith(wrapper);

      let currentIndex = 0;
      const maxIndex = mediaElements.length - 1;

      function updateCarousel() {
        slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === maxIndex;
      }

      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex -= 1;
          updateCarousel();
        }
      });

      nextButton.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
          currentIndex += 1;
          updateCarousel();
        }
      });

      updateCarousel();
    });
  }

  function filterGallery() {
    const galleryCards = Array.from(galleryGrid.querySelectorAll(':scope > .gallery-card'));
    galleryCards.forEach(item => {
      const itemDiscipline = item.dataset.discipline;
      const itemCategory = item.dataset.category;
      const itemMediaType = item.querySelector('video') ? 'video' : 'photo';

      const disciplineMatch = activeDiscipline === 'all' || itemDiscipline === activeDiscipline;
      const categoryMatch = activeCategory === 'all' || itemCategory === activeCategory;
      const mediaTypeMatch = activeMediaType === 'all' || itemMediaType === activeMediaType;

      item.style.display = disciplineMatch && categoryMatch && mediaTypeMatch ? 'flex' : 'none';
    });
  }

  convertMultiImageCards();
  buildCarousels();
  buildHeroCarousel();

  disciplineButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeDiscipline = button.dataset.discipline;
      updateActiveButton(disciplineButtons, button);
      filterGallery();
    });
  });

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      updateActiveButton(categoryButtons, button);
      filterGallery();
    });
  });

  mediaTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeMediaType = button.dataset.mediaType;
      updateActiveButton(mediaTypeButtons, button);
      filterGallery();
    });
  });

  filterGallery();
});
