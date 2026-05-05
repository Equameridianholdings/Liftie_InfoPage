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

// Patch switchTab & switchToView to also reinit reveal
const _origSwitchTab = switchTab;
window.switchTab = function(tab, view) {
    _origSwitchTab(tab, view);
    setTimeout(reinitReveal, 80);
};
const _origSwitchToView = switchToView;
window.switchToView = function(viewId, tabId) {
    _origSwitchToView(viewId, tabId);
    setTimeout(reinitReveal, 80);
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

// ── Hero Slideshow Logic ────────────────────────────────────
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#heroDots .dot');
    if (!slides.length || !dots.length) return;

    let currentSlide = 0;
    const slideDuration = 5000; // 5 seconds per slide
    let slideInterval;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active-slide');
        dots[currentSlide].classList.remove('active');
        dots[currentSlide].style.width = '12px';
        dots[currentSlide].style.background = 'rgba(255,255,255,0.2)';

        currentSlide = index;

        slides[currentSlide].classList.add('active-slide');
        dots[currentSlide].classList.add('active');
        dots[currentSlide].style.width = '32px';
        dots[currentSlide].style.background = 'var(--green)';
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

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
