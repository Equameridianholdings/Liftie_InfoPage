/* ============================================================
   Liftie – Main Script
   Handles: tab navigation, mobile menu, booking widget,
            ripple effects, scroll animations
============================================================ */

// ── Tab Navigation ──────────────────────────────────────────
function switchTab(clickedTab, targetViewId) {
    // Remove active from all tabs
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    // Activate clicked tab
    clickedTab.classList.add('active');
    // Switch view
    showView(targetViewId);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: switch view without needing tab element (called from buttons)
function switchToView(viewId, tabId) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    showView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showView(viewId) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

// ── Mobile Menu ──────────────────────────────────────────────
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const btn   = document.getElementById('hamburgerBtn');
    const open  = menu.classList.toggle('open');
    btn.classList.toggle('menu-open', open);
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('hamburgerBtn').classList.remove('menu-open');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (e) {
    const menu = document.getElementById('mobileMenu');
    const btn   = document.getElementById('hamburgerBtn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.classList.remove('menu-open');
    }
});

// ── Booking / Search ─────────────────────────────────────────
function searchCarpool() {
    const pickup = document.getElementById('pickupInput').value.trim();
    const dest   = document.getElementById('destinationInput').value.trim();
    const when   = document.getElementById('dateInput').value;

    let errors = [];
    if (!pickup) errors.push('Please enter a pickup location.');
    if (!dest)   errors.push('Please enter a destination.');

    if (errors.length > 0) {
        showToast(errors[0], 'error');
        if (!pickup) document.getElementById('pickupInput').focus();
        else if (!dest) document.getElementById('destinationInput').focus();
        return;
    }

    showToast(`Searching carpools from "${pickup}" to "${dest}" …`, 'success');
    // Future: navigate to booking results page or open app deep link
}

// ── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'info') {
    // Remove any existing toast
    const existing = document.getElementById('liftie-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'liftie-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${type === 'error' ? '#c0392b' : '#3d6b2a'};
        color: #fff;
        padding: 14px 28px;
        border-radius: 50px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        z-index: 9999;
        opacity: 0;
        transition: all 0.35s ease;
        max-width: 90vw;
        text-align: center;
        pointer-events: none;
    `;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
    });

    // Auto-dismiss
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(12px)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ── Ripple Effect on Buttons ─────────────────────────────────
document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, .store-btn, .tab-item');
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.18);
        transform: scale(0);
        animation: ripple-anim 0.55s ease-out;
        pointer-events: none;
    `;

    // Ensure button is relatively positioned
    const pos = getComputedStyle(btn).position;
    if (pos === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// Inject ripple keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
@keyframes ripple-anim {
    to { transform: scale(3.5); opacity: 0; }
}
`;
document.head.appendChild(rippleStyle);

// ── Scroll-reveal for cards ───────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity  = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

function initReveal() {
    document.querySelectorAll('.why-cell, .contact-card, .blog-card, .stat-box, .feature-card').forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(el);
    });
}

// Re-run reveal when a tab view changes (so hidden cards animate in)
function reinitReveal() {
    document.querySelectorAll('.page-view.active .why-cell, .page-view.active .contact-card, .page-view.active .blog-card, .page-view.active .stat-box').forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(el);
    });
}

// Patch switchTab & switchToView to also reinit reveal (and lazily
// init the prices map, since it needs a visible, sized container)
const _origSwitchTab = switchTab;
window.switchTab = function(tab, view) {
    _origSwitchTab(tab, view);
    setTimeout(reinitReveal, 80);
    if (view === 'prices-view') ensurePricesMap();
};
const _origSwitchToView = switchToView;
window.switchToView = function(viewId, tabId) {
    _origSwitchToView(viewId, tabId);
    setTimeout(reinitReveal, 80);
    if (viewId === 'prices-view') ensurePricesMap();
};

// ── Hamburger animated icon ───────────────────────────────────
const hamburgerStyle = document.createElement('style');
hamburgerStyle.textContent = `
.hamburger.menu-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.menu-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.menu-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.hamburger span { transition: transform 0.3s ease, opacity 0.3s ease; }
`;
document.head.appendChild(hamburgerStyle);

// ── Init on DOM ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Ensure default view is active
    showView('carpool-view');
    document.getElementById('tab-carpool')?.classList.add('active');

    // Animate hero content immediately
    document.querySelectorAll('.hero-content-wrap > *').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
        el.classList.add('fade-in');
    });

    // Init scroll reveal
    initReveal();

    // Set datetime-local min to now
    const dtInput = document.getElementById('dateInput');
    if (dtInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dtInput.min = now.toISOString().slice(0, 16);
    }

    // "Download App" CTA buttons link to carpool tab & store
    const downloadBtn = document.getElementById('downloadAppBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            window.scrollTo({ top: document.querySelector('.app-section')?.offsetTop || 0, behavior: 'smooth' });
        });
    }

    // Fetch live ZA corporate news
    fetchLiveNews();
});

// ── Live News Fetching (BusinessTech ZA) ──────────────────────
async function fetchLiveNews() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    try {
        // Using rss2json API to fetch BusinessTech feed
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://businesstech.co.za/news/feed/');
        const data = await response.json();

        if (data.status !== 'ok') throw new Error('Failed to fetch RSS');

        grid.innerHTML = ''; // Clear loader
        
        // Take first 3 news items
        const items = data.items.slice(0, 3);
        
        items.forEach(item => {
            // Try to extract an image from the description or enclosure
            let imgUrl = '';
            if (item.enclosure && item.enclosure.link) {
                imgUrl = item.enclosure.link;
            } else {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imgUrl = imgMatch[1];
            }
            
            // Clean HTML from description to create excerpt
            let excerpt = item.description.replace(/<[^>]*>?/gm, '');
            if (excerpt.length > 100) excerpt = excerpt.substring(0, 100) + '...';

            // Format date (e.g. May 05, 2026)
            const dateStr = new Date(item.pubDate).toLocaleDateString('en-US', {
                month: 'long', day: '2-digit', year: 'numeric'
            });

            const card = document.createElement('a');
            card.href = item.link;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.className = "blog-card";
            card.style.textDecoration = "none";
            card.style.color = "inherit";
            card.style.display = "block"; // Make the whole card clickable
            
            card.innerHTML = `
                <div class="blog-img" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>
                <div class="blog-content">
                    <span class="blog-date">${dateStr}</span>
                    <h3>${item.title}</h3>
                    <p>${excerpt}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        // Trigger reveal animation for newly added cards
        setTimeout(reinitReveal, 100);

    } catch (err) {
        console.error('Error fetching live news:', err);
        // Fallback content if API fails
        grid.innerHTML = `
            <a href="#" class="blog-card" style="text-decoration:none; color:inherit; display:block;">
                <div class="blog-img" style="background-color: var(--light-border);"></div>
                <div class="blog-content">
                    <span class="blog-date">Latest Update</span>
                    <h3>The Hidden Costs of Driving Solo</h3>
                    <p>A deep dive into vehicle depreciation, maintenance, and the true cost of an unshared commute.</p>
                </div>
            </a>
            <a href="#" class="blog-card" style="text-decoration:none; color:inherit; display:block;">
                <div class="blog-img" style="background-color: var(--light-border);"></div>
                <div class="blog-content">
                    <span class="blog-date">Platform News</span>
                    <h3>Why Verified Networks Matter</h3>
                    <p>Safety is the primary barrier to shared mobility. Discover how corporate verification changes the game.</p>
                </div>
            </a>
            <a href="#" class="blog-card" style="text-decoration:none; color:inherit; display:block;">
                <div class="blog-img" style="background-color: var(--light-border);"></div>
                <div class="blog-content">
                    <span class="blog-date">Tech Insight</span>
                    <h3>PWA vs Native: Our Strategy</h3>
                    <p>Why we chose to launch Liftie as a Progressive Web App first, ensuring zero friction for new users.</p>
                </div>
            </a>
        `;
    }
}

// ── Contact Form Email Hook ───────────────────────────────────
function sendContactEmail(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();
    
    if (!name || !email || !msg) {
        showToast('Please fill out all required fields.', 'error');
        return;
    }
    
    const subject = encodeURIComponent(`New message from ${name} via Liftie website`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${msg}`);
    
    // Open default mail client pre-filled
    window.location.href = `mailto:info@liftie.co.za?subject=${subject}&body=${body}`;
    
    showToast('Opening your email client...', 'success');
    
    // Reset form after a slight delay
    setTimeout(() => {
        e.target.reset();
    }, 1500);
}

// ── How It Works: rider/driver perspective toggle ────────────
const HOW_PERSPECTIVES = {
    rider: {
        image: 'Liftie_Images/Screenshot 2026-07-03 192436.png',
        alt: 'Requesting a lift on the Liftie app'
    },
    driver: {
        image: 'Liftie_Images/pexels-jonathankwuka-17234883.jpg',
        alt: 'Driver accepting a matched rider on the Liftie app'
    }
};

function setHowPerspective(perspective) {
    const data = HOW_PERSPECTIVES[perspective];
    if (!data) return;

    document.getElementById('howToggleRider').classList.toggle('active', perspective === 'rider');
    document.getElementById('howToggleDriver').classList.toggle('active', perspective === 'driver');

    document.getElementById('howTimelineRider').style.display = perspective === 'rider' ? 'block' : 'none';
    document.getElementById('howTimelineDriver').style.display = perspective === 'driver' ? 'block' : 'none';

    const img = document.getElementById('howImage');
    img.src = data.image;
    img.alt = data.alt;
}

// ── Scroll Reveal Animations ─────────────────────────────────
function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
}

// Re-initialize reveals (useful for dynamic content like news)
window.reinitReveal = initScrollReveals;

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveals();
    initHeroSlider();
    initFeatureCarousel();
});

// ── Word-fill reveal animation ───────────────────────────────
// Splits the text inside `el` into per-word <span class="hero-word">
// elements (preserving any nested markup, e.g. the accent-green span)
// so each word can be animated into view individually.
function wrapWordsInElement(el) {
    if (el.dataset.wordsWrapped === '1') return;
    el.dataset.wordsWrapped = '1';

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(part => {
                if (part === '') return;
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.className = 'hero-word';
                    span.textContent = part;
                    frag.appendChild(span);
                }
            });
            node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processNode);
        }
    }
    Array.from(el.childNodes).forEach(processNode);
}

// Replays the word-fill reveal for a given slide element
function playWordFill(slideEl) {
    const headlineWords = slideEl.querySelectorAll('.hero-headline .hero-word');
    const subWords = slideEl.querySelectorAll('.hero-sub .hero-word');

    function stage(words, startDelay, stepMs) {
        words.forEach((w, i) => {
            w.classList.remove('filled');
            w.style.transitionDelay = (startDelay + i * stepMs) + 'ms';
        });
    }
    stage(headlineWords, 0, 45);
    stage(subWords, headlineWords.length * 45 + 150, 12);

    // Force reflow so the class removal above actually takes effect
    // before we re-add it on the next frame.
    void slideEl.offsetWidth;
    requestAnimationFrame(() => {
        headlineWords.forEach(w => w.classList.add('filled'));
        subWords.forEach(w => w.classList.add('filled'));
    });
}

// ── Hero Slideshow Logic ────────────────────────────────────
const heroStats = [
    {
        top: { value: '50%', label: 'Avg. Fare Savings', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
        bottom: { value: 'Split', label: 'Cost With Friends', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' }
    },
    {
        top: { value: '100%', label: 'Verified Drivers', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
        bottom: { value: 'Weekly', label: 'Driver Payouts', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' }
    },
    {
        top: { value: 'Instant', label: 'Route Matching', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
        bottom: { value: 'Live', label: 'Route Tracking', icon: ['M15 10.5a3 3 0 11-6 0 3 3 0 016 0z', 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z'] }
    },
    {
        top: { value: 'Any Car', label: 'Same Destination', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z' },
        bottom: { value: 'One Fare', label: 'Shared By All', icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z' }
    }
];

function applyHeroStat(el, data) {
    const iconEl = el.querySelector('.hero-stat-icon');
    const valueEl = el.querySelector('.hero-stat-value');
    const labelEl = el.querySelector('.hero-stat-label');
    if (!iconEl || !valueEl || !labelEl) return;

    const paths = Array.isArray(data.icon) ? data.icon : [data.icon];
    iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">${paths.map(d => `<path stroke-linecap="round" stroke-linejoin="round" d="${d}" />`).join('')}</svg>`;
    valueEl.textContent = data.value;
    labelEl.textContent = data.label;
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const images = document.querySelectorAll('.hero-slide-image');
    const dots = document.querySelectorAll('#heroDots .dot');
    const statTop = document.querySelector('.hero-stat-top');
    const statBottom = document.querySelector('.hero-stat-bottom');
    if (!slides.length || !dots.length) return;

    slides.forEach(slide => {
        wrapWordsInElement(slide.querySelector('.hero-headline'));
        wrapWordsInElement(slide.querySelector('.hero-sub'));
    });

    let currentSlide = 0;
    const slideDuration = 5000; // 5 seconds per slide
    let slideInterval;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active-slide');
        if (images[currentSlide]) images[currentSlide].classList.remove('active-slide-image');
        dots[currentSlide].classList.remove('active');
        dots[currentSlide].style.width = '12px';
        dots[currentSlide].style.background = 'rgba(0,0,0,0.12)';

        currentSlide = index;

        slides[currentSlide].classList.add('active-slide');
        if (images[currentSlide]) images[currentSlide].classList.add('active-slide-image');
        dots[currentSlide].classList.add('active');
        dots[currentSlide].style.width = '32px';
        dots[currentSlide].style.background = 'var(--green)';

        playWordFill(slides[currentSlide]);
        const stat = heroStats[currentSlide];
        if (stat) {
            if (statTop) applyHeroStat(statTop, stat.top);
            if (statBottom) applyHeroStat(statBottom, stat.bottom);
        }
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    // Play the reveal for the slide that's already active on load
    playWordFill(slides[currentSlide]);

    // Auto play
    slideInterval = setInterval(nextSlide, slideDuration);

    // Click on dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index);
            slideInterval = setInterval(nextSlide, slideDuration);
        });
    });
}

// ── Feature Carousel Auto-Scroll ─────────────────────────────
function initFeatureCarousel() {
    const carousel = document.getElementById('featureCarousel');
    if (!carousel) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;

    // Mouse drag to scroll
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        clearInterval(autoScrollInterval); // Pause on interact
    });
    carousel.addEventListener('mouseleave', () => {
        if(!isDown) return;
        isDown = false;
        carousel.style.cursor = 'grab';
        startAutoScroll(); // Resume
    });
    carousel.addEventListener('mouseup', () => {
        if(!isDown) return;
        isDown = false;
        carousel.style.cursor = 'grab';
        startAutoScroll(); // Resume
    });
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        carousel.scrollLeft = scrollLeft - walk;
    });
    
    // Touch interactions (pause auto scroll)
    carousel.addEventListener('touchstart', () => clearInterval(autoScrollInterval), {passive: true});
    carousel.addEventListener('touchend', startAutoScroll, {passive: true});

    // Auto scroll logic
    function startAutoScroll() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            // Determine card width approx (+ gap)
            const cardWidth = 344;
            
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
                // Reset to start if at the end
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll by one card width
                carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }, 4000); // every 4 seconds
    }

    startAutoScroll();
}

// ── Prices page: Google Maps + Places Autocomplete + fare estimate ──
// Distance is straight-line (via the Maps geometry library) rather than
// a driven route, since only Maps JavaScript API + Places API are
// enabled on this key (no Directions API) — enable that too for a
// real driving-route distance instead.
const PRICE_PER_KM = 4.50; // R4.50/km — placeholder Economy-tier rate

let pricesMap = null;
let pricesMapReady = false;
let priceOriginMarker = null;
let priceDestMarker = null;
const priceSelectedCoords = { origin: null, destination: null };

// Simple teardrop pin (SVG path) so origin/destination can be recolored
// independently while keeping the exact same pin shape.
function pinIcon(color) {
    return {
        path: 'M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#00000040',
        strokeWeight: 1,
        scale: 1.5,
        anchor: new google.maps.Point(12, 22)
    };
}

// Free, keyless fallback (OpenStreetMap Nominatim) for the rare case a
// user types an address but never picks a suggestion from the widget.
async function geocodeLocation(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Location lookup failed. Please try again.');
    const data = await res.json();
    if (!data.length) throw new Error(`Couldn't find "${query}". Try a more specific address.`);
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

function ensurePricesMap() {
    const mapEl = document.getElementById('pricesMap');
    if (!mapEl || typeof google === 'undefined' || !google.maps) return;

    if (pricesMapReady) {
        google.maps.event.trigger(pricesMap, 'resize');
        return;
    }

    pricesMap = new google.maps.Map(mapEl, {
        center: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
    });
    pricesMapReady = true;
}

function setupPlaceAutocomplete(inputId, coordsKey) {
    const input = document.getElementById(inputId);
    if (!input || typeof google === 'undefined' || !google.maps || !google.maps.places) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'za' },
        fields: ['geometry', 'formatted_address']
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
            priceSelectedCoords[coordsKey] = {
                lat: place.geometry.location.lat(),
                lon: place.geometry.location.lng()
            };
        } else {
            priceSelectedCoords[coordsKey] = null;
        }
    });

    input.addEventListener('input', () => {
        priceSelectedCoords[coordsKey] = null; // typing invalidates the previously picked place
    });
}

// Called by the Google Maps script tag once the API (incl. Places
// library) has finished loading — see the callback= param in index.html.
function onGoogleMapsReady() {
    setupPlaceAutocomplete('priceOrigin', 'origin');
    setupPlaceAutocomplete('priceDestination', 'destination');

    const activeView = document.querySelector('.page-view.active');
    if (activeView && activeView.id === 'prices-view') ensurePricesMap();
}

async function calculatePrice() {
    const originInput = document.getElementById('priceOrigin');
    const destInput = document.getElementById('priceDestination');
    const btn = document.getElementById('priceCalcBtn');
    const resultEl = document.getElementById('priceResult');
    const errorEl = document.getElementById('priceError');

    const originQuery = originInput.value.trim();
    const destQuery = destInput.value.trim();

    errorEl.style.display = 'none';
    resultEl.style.display = 'none';
    document.getElementById('priceCarpoolCard').style.display = 'none';

    if (!originQuery || !destQuery) {
        errorEl.textContent = 'Please enter both a pickup and dropoff location.';
        errorEl.style.display = 'block';
        return;
    }

    ensurePricesMap();
    if (!pricesMap) {
        errorEl.textContent = 'Google Maps failed to load. Check your internet connection and try again.';
        errorEl.style.display = 'block';
        return;
    }

    const originalLabel = btn.textContent;
    btn.textContent = 'Calculating…';
    btn.disabled = true;

    try {
        const [origin, dest] = await Promise.all([
            priceSelectedCoords.origin || geocodeLocation(originQuery + ', South Africa'),
            priceSelectedCoords.destination || geocodeLocation(destQuery + ', South Africa')
        ]);

        const originLatLng = new google.maps.LatLng(origin.lat, origin.lon);
        const destLatLng = new google.maps.LatLng(dest.lat, dest.lon);

        if (priceOriginMarker) priceOriginMarker.setMap(null);
        if (priceDestMarker) priceDestMarker.setMap(null);

        priceOriginMarker = new google.maps.Marker({ position: originLatLng, map: pricesMap, title: 'Pickup: ' + originQuery, icon: pinIcon('#c0392b') });
        priceDestMarker = new google.maps.Marker({ position: destLatLng, map: pricesMap, title: 'Dropoff: ' + destQuery, icon: pinIcon('#3d6b2a') });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(originLatLng);
        bounds.extend(destLatLng);
        pricesMap.fitBounds(bounds, 60);

        const km = google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng) / 1000;
        const price = km * PRICE_PER_KM; // PRICE_PER_KM is a static placeholder, not a real dynamic rate
        document.getElementById('priceDistance').textContent = `${km.toFixed(1)} km`;
        document.getElementById('priceEstimate').textContent = `R${price.toFixed(2)}`;
        resultEl.style.display = 'block';

        const perPersonPrice = price / 3;
        const savings = price - perPersonPrice; // what a solo rider would have paid, minus their 1/3 share
        document.getElementById('priceCarpoolAmount').textContent = `R${perPersonPrice.toFixed(2)}`;
        document.getElementById('priceCarpoolSavings').textContent = `R${savings.toFixed(2)}`;
        document.getElementById('priceCarpoolCard').style.display = 'block';
    } catch (err) {
        errorEl.textContent = err.message || 'Something went wrong. Please try more specific locations.';
        errorEl.style.display = 'block';
    } finally {
        btn.textContent = originalLabel;
        btn.disabled = false;
    }
}
