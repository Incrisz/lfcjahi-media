/**
 * LFC-JAHI Theme Toggle
 * Centralized dark/light mode toggle for all pages
 */
(function() {
  'use strict';

  const DARK_LOGO = 'images/logo-1.png';
  const LIGHT_LOGO = 'images/logo-2.png';

  // Swap logos based on theme (only header logos, footer stays dark)
  function updateLogos(isDark) {
    const logoSrc = isDark ? DARK_LOGO : LIGHT_LOGO;
    // Only update header logos, not footer (footer is always dark)
    const logos = document.querySelectorAll('.navbar-brand .logo');
    logos.forEach(function(logo) {
      logo.src = logoSrc;
    });
  }

  // Initialize theme on page load (runs immediately)
  function initTheme() {
    const htmlElement = document.documentElement;
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('darkMode') !== 'false');
    
    if (isDarkMode) {
      htmlElement.setAttribute('data-dark-mode', 'true');
    } else {
      htmlElement.removeAttribute('data-dark-mode');
    }
  }

  // Initialize theme immediately (before DOM ready)
  initTheme();

  // Set up toggle button when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    // Update logos on page load
    const isCurrentlyDark = htmlElement.getAttribute('data-dark-mode') === 'true';
    updateLogos(isCurrentlyDark);
    
    if (!darkModeToggle) return;

    // Set initial icon based on current state
    darkModeToggle.innerHTML = isCurrentlyDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    // Toggle handler
    darkModeToggle.addEventListener('click', function() {
      const isDark = htmlElement.getAttribute('data-dark-mode') === 'true';
      
      if (isDark) {
        htmlElement.removeAttribute('data-dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('darkMode', 'false');
        updateLogos(false);
      } else {
        htmlElement.setAttribute('data-dark-mode', 'true');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('darkMode', 'true');
        updateLogos(true);
      }
    });
  });
})();
