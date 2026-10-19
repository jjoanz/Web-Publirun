'use strict';
// Publirun: el contenido se administra desde el panel (CMS) y se pinta aquí.
// Si el CMS no responde, se usa content.json (copia de respaldo publicada junto a la página).

const IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
// En pruebas locales se puede apuntar a otro CMS con ?cms=http://localhost:3300
const CMS_URL = (IS_LOCAL && new URLSearchParams(location.search).get('cms'))
    || (document.querySelector('meta[name="cms-url"]') || {}).content || '';
let mediaBase = CMS_URL;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function get(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// *texto* sale en naranja.
function marked(s) {
    return escapeHtml(s).replace(/\*([^*]+)\*/g, '<span class="text-orange">$1</span>');
}

function media(url) {
    if (!url) return '';
    return url.startsWith('/media/') ? mediaBase + url : url;
}

function srcset(url) {
    if (!/-1600\.webp$/.test(url || '')) return '';
    return `${media(url.replace(/-1600\.webp$/, '-600.webp'))} 600w, ${media(url)} 1600w`;
}

function img(url, alt, { sizes = '(max-width: 768px) 100vw, 50vw', lazy = true, cls = '' } = {}) {
    const set = srcset(url);
    return `<img src="${escapeHtml(media(url))}"${set ? ` srcset="${escapeHtml(set)}" sizes="${sizes}"` : ''} alt="${escapeHtml(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ''}${cls ? ` class="${cls}"` : ''}>`;
}

function safeLink(href) {
    const h = String(href || '').trim();
    return /^(https?:|mailto:|tel:|#|\/)/i.test(h) ? h : '#';
}

async function fetchJson(url, ms) {
    const res = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined, cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function loadContent() {
    if (CMS_URL) {
        try {
            const c = await fetchJson(`${CMS_URL}/api/content`, 5000);
            mediaBase = CMS_URL;
            return c;
        } catch (e) {
            console.warn('CMS no disponible, se usa la copia local.', e.message);
        }
    }
    mediaBase = '';
    return fetchJson('content.json', 8000);
}

// ---------------- pintar ----------------
function renderBindings(c) {
    $$('[data-cms-text]').forEach(n => { const v = get(c, n.dataset.cmsText); n.textContent = v ?? ''; n.hidden = !v; });
    $$('[data-cms-mark]').forEach(n => { n.innerHTML = marked(get(c, n.dataset.cmsMark) || ''); });
    $$('[data-cms-src]').forEach(n => { const v = get(c, n.dataset.cmsSrc); if (v) { n.src = media(v); n.removeAttribute('srcset'); } });
    const wa = `https://wa.me/${String(c.site.whatsapp || '').replace(/\D/g, '')}`;
    $$('[data-cms-wa]').forEach(n => { n.href = wa; });
    $$('[data-cms-mail]').forEach(n => { n.href = `mailto:${c.site.email || ''}`; });
}

function renderSeo(c) {
    const seo = c.site.seo || {};
    if (seo.title) document.title = seo.title;
    const setMeta = (name, value) => { if (!value) return; let m = $(`meta[name="${name}"]`); if (!m) { m = document.createElement('meta'); m.name = name; document.head.append(m); } m.content = value; };
    setMeta('description', seo.description);
    setMeta('keywords', (seo.keywords || []).join(', '));
}

const SECTION_IDS = { about: 'nosotros', products: 'productos', services: 'servicios', gallery: 'galeria', clients: 'clientes', instagram: 'instagram', contact: 'contactos' };

function renderNav(c) {
    $$('[data-section]').forEach(s => { s.hidden = (c[s.dataset.section] || {}).visible === false; });
    const links = [{ id: 'inicio', label: 'Inicio' }];
    for (const [key, id] of Object.entries(SECTION_IDS)) {
        const s = c[key];
        if (s && s.visible !== false && s.navLabel) links.push({ id, label: s.navLabel });
    }
    $('#navList').innerHTML = links.map((l, i) => `<li><a href="#${l.id}" class="nav-link${i === 0 ? ' active' : ''}">${escapeHtml(l.label.toUpperCase())}</a></li>`).join('');
    $('#footerLinks').innerHTML = links.map(l => `<li><a href="#${l.id}">${escapeHtml(l.label)}</a></li>`).join('');
}

function renderHero(c) {
    const h = c.hero || {};
    const hero = $('#inicio');
    hero.style.setProperty('--hero-bg', h.background || '#e4e3e7');
    $('#heroButtons').innerHTML = (h.buttons || []).map(b =>
        `<a href="${escapeHtml(safeLink(b.link))}" class="${b.style === 'primary' ? 'btn-primary' : 'btn-secondary'}">${escapeHtml(b.text)}</a>`).join('');

    const video = $('#heroVideo');
    const mobile = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1024px)').matches;
    const src = media(mobile ? (h.videoMobile || h.videoDesktop) : (h.videoDesktop || h.videoMobile));
    const poster = media(mobile ? (h.posterMobile || h.posterDesktop) : (h.posterDesktop || h.posterMobile));
    hero.classList.toggle('hero-vertical', mobile && Boolean(h.videoMobile));
    if (poster) video.poster = poster;
    video.loop = Boolean(h.loop);
    if (src && video.getAttribute('src') !== src) {
        video.src = src;
        const play = video.play();
        if (play) play.catch(() => { /* el navegador bloqueó la reproducción; queda la imagen */ });
    }
    hero.classList.toggle('no-video', !src);
}

function renderAbout(c) {
    const a = c.about || {};
    $('#aboutParagraphs').innerHTML = (a.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    $('#aboutPillars').innerHTML = (a.pillars || []).map(p => `
        <div class="pillar reveal">
            <div class="pillar-icon"><i class="fas ${escapeHtml(p.icon || 'fa-star')}"></i></div>
            <div><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.text)}</p></div>
        </div>`).join('');
    const card = $('#aboutCard');
    card.style.backgroundImage = a.cardImage ? `linear-gradient(rgba(0,48,87,.86), rgba(0,48,87,.9)), url("${media(a.cardImage)}")` : '';
}

function renderProducts(c) {
    $('#productsGrid').innerHTML = ((c.products || {}).items || []).map(p => `
        <article class="product-card reveal">
            <div class="product-icon"><i class="fas ${escapeHtml(p.icon || 'fa-star')}"></i></div>
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.text)}</p>
        </article>`).join('');
}

function renderServices(c) {
    const areas = (c.services || {}).areas || [];
    const tabs = $('#serviceTabs');
    const panel = $('#servicePanel');
    tabs.innerHTML = areas.map((a, i) => `
        <button class="service-tab" role="tab" id="stab-${i}" aria-controls="servicePanel" aria-selected="${i === 0}" data-i="${i}">
            <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
            <i class="fas ${escapeHtml(a.icon || 'fa-star')}"></i>
            <span class="service-name">${escapeHtml(a.title)}</span>
        </button>`).join('');
    const show = (i) => {
        const a = areas[i];
        if (!a) { panel.innerHTML = ''; return; }
        $$('.service-tab', tabs).forEach((t, j) => t.setAttribute('aria-selected', String(j === i)));
        panel.setAttribute('aria-labelledby', `stab-${i}`);
        panel.innerHTML = `
            <div class="service-detail">
                <span class="service-detail-num">${String(i + 1).padStart(2, '0')}</span>
                <h3>${escapeHtml(a.title)}</h3>
                ${a.description ? `<p class="service-desc">${escapeHtml(a.description)}</p>` : ''}
                <ul class="service-chips">${(a.items || []).map(s => `<li><i class="fas fa-check"></i>${escapeHtml(s)}</li>`).join('')}</ul>
                <a href="#contactos" class="btn-primary">Cotizar ${escapeHtml(a.title.toLowerCase())}</a>
            </div>
            <div class="service-image">${a.image ? img(a.image, a.title) : ''}</div>`;
        panel.classList.remove('swap');
        void panel.offsetWidth;
        panel.classList.add('swap');
    };
    tabs.onclick = (e) => { const b = e.target.closest('.service-tab'); if (b) show(Number(b.dataset.i)); };
    tabs.onkeydown = (e) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
        const btns = $$('.service-tab', tabs);
        const cur = btns.indexOf(document.activeElement);
        if (cur < 0) return;
        e.preventDefault();
        const next = (cur + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
        btns[next].focus(); show(next);
    };
    show(0);
    $('#footerServices').innerHTML = areas.map(a => `<li><a href="#servicios">${escapeHtml(a.title)}</a></li>`).join('');
}

let galleryList = [];
function renderGallery(c) {
    const g = c.gallery || {};
    const cats = (g.categories || []).filter(cat => (g.items || []).some(i => i.category === cat.id));
    const filters = $('#galleryFilters');
    filters.innerHTML = `<button class="filter-btn active" data-filter="all">Todos</button>` +
        cats.map(cat => `<button class="filter-btn" data-filter="${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</button>`).join('') +
        (g.portfolioFile ? `<a class="filter-btn portfolio-btn" href="${escapeHtml(media(g.portfolioFile))}" target="_blank" rel="noopener"><i class="fas fa-file-pdf"></i> ${escapeHtml(g.portfolioLabel || 'Ver portafolio')}</a>` : '');
    const grid = $('#galleryGrid');
    const draw = (filter) => {
        galleryList = (g.items || []).filter(i => i.image && (filter === 'all' || i.category === filter));
        grid.innerHTML = galleryList.map((it, idx) => `
            <button class="gallery-item" data-idx="${idx}" aria-label="Ver ${escapeHtml(it.title || 'foto')}">
                ${img(it.image, it.title || '', { sizes: '(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw' })}
                <span class="gallery-overlay"><span class="gallery-info">
                    <span class="gallery-title">${escapeHtml(it.title)}</span>
                    <span class="gallery-view-btn"><i class="fas fa-search-plus"></i> Ver más</span>
                </span></span>
            </button>`).join('');
    };
    filters.onclick = (e) => {
        const b = e.target.closest('button.filter-btn');
        if (!b) return;
        $$('.filter-btn', filters).forEach(x => x.classList.toggle('active', x === b));
        draw(b.dataset.filter);
    };
    grid.onclick = (e) => { const b = e.target.closest('.gallery-item'); if (b) openLightbox(Number(b.dataset.idx)); };
    draw('all');
}

function renderClients(c) {
    const cl = c.clients || {};
    const logos = (cl.logos || []).filter(l => l.image);
    const box = $('#clientsMarquee');
    if (!logos.length) { box.innerHTML = ''; return; }
    const item = (l, hidden) => `<li class="client-circle"${hidden ? ' aria-hidden="true"' : ''}>${img(l.image, hidden ? '' : l.name, { sizes: '160px' })}</li>`;
    // Dos copias seguidas para que la cinta sea continua.
    const row = logos.map(l => item(l, false)).join('') + logos.map(l => item(l, true)).join('');
    box.style.setProperty('--marquee-time', `${Math.max(10, Number(cl.speed) || 40)}s`);
    box.innerHTML = `<ul class="marquee-track">${row}</ul>`;
}

async function renderInstagram(c) {
    const ig = c.instagram || {};
    if (ig.visible === false) return;
    const handle = String(ig.handle || '').replace(/^@/, '');
    const profile = (c.site.social && c.site.social.instagram) || (handle ? `https://www.instagram.com/${handle}/` : '');
    const follow = $('#instaFollow');
    follow.href = safeLink(profile);
    follow.querySelector('span').textContent = handle ? `Seguir a @${handle}` : 'Ver Instagram';
    let posts = [];
    if (mediaBase) {
        try { posts = (await fetchJson(`${CMS_URL}/api/instagram`, 5000)).posts || []; } catch { /* sin conexión: publicaciones manuales */ }
    }
    if (!posts.length) posts = (ig.manualPosts || []).filter(p => p.image).map(p => ({ ...p, image: media(p.image), manual: true }));
    posts = posts.slice(0, Math.max(1, Number(ig.count) || 6));
    const grid = $('#instaGrid');
    if (!posts.length) {
        grid.innerHTML = `<p class="insta-empty">Mira nuestros trabajos más recientes en Instagram.</p>`;
        return;
    }
    grid.innerHTML = posts.map(p => `
        <a class="insta-post reveal" href="${escapeHtml(safeLink(p.link || profile))}" target="_blank" rel="noopener" aria-label="${escapeHtml(p.caption ? p.caption.slice(0, 80) : 'Publicación de Instagram')}">
            <img src="${escapeHtml(p.image)}" alt="" loading="lazy" decoding="async"${p.manual ? '' : ' referrerpolicy="no-referrer"'}>
            ${p.isVideo ? '<i class="fas fa-play insta-video"></i>' : ''}
            <span class="insta-hover"><i class="fab fa-instagram"></i></span>
        </a>`).join('');
    observeReveal();
}

function renderFooter(c) {
    const s = c.site.social || {};
    const icons = { instagram: 'fa-instagram', facebook: 'fa-facebook-f', tiktok: 'fa-tiktok', linkedin: 'fa-linkedin-in', twitter: 'fa-x-twitter', youtube: 'fa-youtube' };
    $('#footerSocial').innerHTML = Object.entries(icons).filter(([k]) => s[k]).map(([k, ic]) =>
        `<a href="${escapeHtml(safeLink(s[k]))}" aria-label="${k}" target="_blank" rel="noopener"><i class="fab ${ic}"></i></a>`).join('');
    const copy = ((c.footer || {}).copyright || '© {año} Publirun. Todos los derechos reservados.').replace('{año}', new Date().getFullYear());
    $('#copyright').textContent = copy;
}

// ---------------- visor de fotos ----------------
let lbIndex = 0;
let lbReturnFocus = null;
function openLightbox(i) {
    const it = galleryList[i];
    if (!it) return;
    lbIndex = i;
    const lb = $('#lightbox');
    const im = $('#lightboxImg');
    im.src = media(it.image);
    im.alt = it.title || '';
    $('#lightboxTitle').textContent = it.title || '';
    $('#lightboxDesc').textContent = it.description || '';
    if (lb.hidden) { lbReturnFocus = document.activeElement; lb.hidden = false; document.body.classList.add('no-scroll'); $('.lightbox-close').focus(); }
}
function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.classList.remove('no-scroll');
    if (lbReturnFocus) lbReturnFocus.focus();
}
function stepLightbox(d) { openLightbox((lbIndex + d + galleryList.length) % galleryList.length); }

$('#lightbox').addEventListener('click', (e) => {
    const act = e.target.closest('[data-lb]');
    if (act) { const a = act.dataset.lb; if (a === 'close') closeLightbox(); else stepLightbox(a === 'next' ? 1 : -1); return; }
    if (e.target.id === 'lightbox') closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') stepLightbox(1);
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
});
let touchX = null;
$('#lightbox').addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
$('#lightbox').addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
});

// ---------------- comportamiento general ----------------
const header = $('#header');
const nav = $('#nav');
const menuToggle = $('#menuToggle');

function setMenu(open) {
    nav.classList.toggle('active', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
}
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('active')));

document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1, behavior: 'smooth' });
});

function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
    let current = 'inicio';
    for (const s of $$('main > section:not([hidden])')) {
        if (window.scrollY >= s.offsetTop - header.offsetHeight - 40) current = s.id;
    }
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', onScroll, { passive: true });

const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); revealObserver.unobserve(en.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    : null;
function observeReveal() {
    $$('.reveal:not(.visible)').forEach(n => { if (revealObserver) revealObserver.observe(n); else n.classList.add('visible'); });
}

// ---------------- arranque ----------------
(async () => {
    try {
        const c = await loadContent();
        renderSeo(c);
        renderNav(c);
        renderBindings(c);
        renderHero(c);
        renderAbout(c);
        renderProducts(c);
        renderServices(c);
        renderGallery(c);
        renderClients(c);
        renderFooter(c);
        observeReveal();
        renderInstagram(c);
    } catch (e) {
        console.error('No se pudo cargar el contenido', e);
    } finally {
        document.body.classList.remove('is-loading');
        onScroll();
        if (location.hash.length > 1) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
    }
})();
