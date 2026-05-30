/**
 * Solarpunk Guide — Main JavaScript
 * Phase 8: Navigation dropdown, Countdown, ToC, Back-to-Top, Reading Time
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ==============================================
     1. MOBILE NAVIGATION TOGGLE
     ============================================== */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-active');
      document.body.classList.toggle('nav-open', !expanded);
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('is-active') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
    });
  }

  /* ==============================================
     2. DROPDOWN NAVIGATION (Desktop hover + click / Mobile accordion)
     ============================================== */
  const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

  dropdownToggles.forEach(function (toggle) {
    const dropdownMenu = toggle.nextElementSibling;
    if (!dropdownMenu) return;

    // ── Desktop: hover opens dropdown ──
    const dropdownParent = toggle.parentElement;

    dropdownParent.addEventListener('mouseenter', function () {
      if (window.innerWidth >= 768) {
        openDropdown(toggle, dropdownMenu);
      }
    });

    dropdownParent.addEventListener('mouseleave', function () {
      if (window.innerWidth >= 768) {
        closeDropdown(toggle, dropdownMenu);
      }
    });

    // ── Click toggle (both desktop and mobile) ──
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains('is-open');
      if (isOpen) {
        closeDropdown(toggle, dropdownMenu);
      } else {
        // Close all other dropdowns first
        closeAllDropdowns();
        openDropdown(toggle, dropdownMenu);
      }
    });

    // ── Close when clicking a link inside dropdown ──
    dropdownMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDropdown(toggle, dropdownMenu);
        // On mobile, also close the main nav
        if (window.innerWidth < 768) {
          navMenu.classList.remove('is-active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        }
      });
    });
  });

  // ── Close all dropdowns when clicking outside ──
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
  });

  // ── Close dropdowns on Escape ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  function openDropdown(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
  }

  function closeDropdown(toggle, menu) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }

  function closeAllDropdowns() {
    dropdownToggles.forEach(function (toggle) {
      const menu = toggle.nextElementSibling;
      if (menu) {
        closeDropdown(toggle, menu);
      }
    });
  }

  /* ==============================================
     3. COUNTDOWN TIMER (Solarpunk Launch: June 8, 2026)
     ============================================== */
  const countdownDays = document.getElementById('countdown-days');
  if (countdownDays) {
    const launchDate = new Date('2026-06-08T00:00:00Z');

    function updateCountdown() {
      const now = new Date();
      const diffMs = launchDate - now;

      if (diffMs <= 0) {
        countdownDays.textContent = '🎉';
        const label = document.querySelector('.countdown-label');
        if (label) label.textContent = 'Out Now!';
        return;
      }

      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      countdownDays.textContent = diffDays;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60);
  }

  /* ==============================================
     4. BACK TO TOP BUTTON
     ============================================== */
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '&#8593;';
  document.body.appendChild(backToTop);

  function toggleBackToTop() {
    if (window.scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', toggleBackToTop, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  toggleBackToTop();

  /* ==============================================
     5. CURRENT YEAR (Footer Copyright)
     ============================================== */
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* ==============================================
     6. SMOOTH SCROLL for same-page anchor links
     ============================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ==============================================
     7. TABLE OF CONTENTS — Auto-generate from H2s
     ============================================== */
  const tocList = document.getElementById('toc-list');
  const articleContent = document.querySelector('.article-content');

  if (tocList && articleContent) {
    const headings = articleContent.querySelectorAll('h2');
    if (headings.length > 0) {
      tocList.innerHTML = '';

      headings.forEach(function (h2, index) {
        if (!h2.id) {
          h2.id = 'section-' + (index + 1);
        }
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h2.id;
        a.textContent = h2.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
      });

      const tocLinks = tocList.querySelectorAll('a');
      const headingElements = Array.from(headings);

      function highlightToc() {
        let current = '';
        headingElements.forEach(function (h2) {
          const top = h2.getBoundingClientRect().top;
          if (top < 120) {
            current = h2.id;
          }
        });
        tocLinks.forEach(function (link) {
          link.classList.toggle(
            'toc-active',
            link.getAttribute('href') === '#' + current
          );
        });
      }

      window.addEventListener('scroll', highlightToc, { passive: true });
    } else {
      const tocContainer = document.getElementById('article-toc');
      if (tocContainer) {
        tocContainer.style.display = 'none';
      }
    }
  }

  /* ==============================================
     8. READING TIME — Calculate from article body
     ============================================== */
  const readingTimeSpan = document.getElementById('reading-time');
  if (readingTimeSpan && articleContent) {
    const text = articleContent.textContent || '';
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(wordCount / 238));
    readingTimeSpan.textContent = minutes + ' min read';
  }

});
