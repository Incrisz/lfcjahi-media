(function () {
  var monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var searchInput = document.getElementById('searchInput');
  var yearFilter = document.getElementById('yearFilter');
  var monthFilter = document.getElementById('monthFilter');
  var pastorFilter = document.getElementById('pastorFilter');
  var sortFilter = document.getElementById('sortFilter');
  var searchButton = document.getElementById('searchButton');
  var clearFiltersBtn = document.getElementById('clearFilters');
  var messageGrid = document.getElementById('messageGrid');
  var resultCount = document.getElementById('resultCount');
  var noResults = document.getElementById('noResults');
  var latestMessageLinks = [
    document.getElementById('latestMessageLink'),
    document.getElementById('quickPlayLatestLink'),
    document.getElementById('startListeningLink'),
    document.getElementById('footerLatestMessageLink')
  ].filter(Boolean);

  var urlParams = new URLSearchParams(window.location.search);
  var initialized = false;
  var messages = [];

  function parseDate(value) {
    return new Date(value + 'T00:00:00');
  }

  function formatDate(value) {
    return parseDate(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function populateFilters() {
    yearFilter.innerHTML = '<option value="">All Years</option>';
    monthFilter.innerHTML = '<option value="">All Months</option>';
    pastorFilter.innerHTML = '<option value="">All Pastors</option>';

    var years = Array.from(new Set(messages.map(function (msg) {
      return parseDate(msg.date).getFullYear();
    }))).sort(function (a, b) {
      return b - a;
    });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearFilter.appendChild(option);
    });

    monthNames.forEach(function (month, index) {
      var option = document.createElement('option');
      option.value = String(index + 1);
      option.textContent = month;
      monthFilter.appendChild(option);
    });

    var pastors = Array.from(new Set(messages.map(function (msg) {
      return msg.pastor;
    }))).sort();

    pastors.forEach(function (pastor) {
      var option = document.createElement('option');
      option.value = pastor;
      option.textContent = pastor;
      pastorFilter.appendChild(option);
    });
  }

  function sortMessages(items) {
    var sortValue = sortFilter.value;

    return items.sort(function (a, b) {
      if (sortValue === 'oldest') {
        return parseDate(a.date) - parseDate(b.date);
      }
      if (sortValue === 'duration-asc') {
        return a.durationMinutes - b.durationMinutes;
      }
      if (sortValue === 'duration-desc') {
        return b.durationMinutes - a.durationMinutes;
      }
      if (sortValue === 'title') {
        return a.title.localeCompare(b.title);
      }
      return parseDate(b.date) - parseDate(a.date);
    });
  }

  function cardMarkup(msg) {
    var detailUrl = 'single-message.html?id=' + encodeURIComponent(msg.id);
    var pastorImage = msg.speakerImage || msg.image;

    return (
      '<div class="col-xl-3 col-lg-4 col-md-6 mb-4">' +
        '<a class="lfc-card-link" href="' + detailUrl + '">' +
          '<div class="gen-carousel-movies-style-1 movie-grid style-1">' +
            '<div class="gen-movie-contain">' +
              '<div class="gen-movie-img">' +
                '<img src="' + msg.image + '" alt="' + msg.title + '">' +
                '<div class="gen-movie-action">' +
                  '<span class="gen-button" aria-label="Play ' + msg.title + '"><i class="fa fa-play"></i></span>' +
                '</div>' +
              '</div>' +
              '<div class="gen-info-contain">' +
                '<div class="gen-movie-info">' +
                  '<h3>' + msg.title + '</h3>' +
                '</div>' +
                '<div class="gen-movie-meta-holder">' +
                  '<ul>' +
                    '<li>' + msg.duration + '</li>' +
                    '<li><span>' + formatDate(msg.date) + '</span></li>' +
                  '</ul>' +
                '</div>' +
                '<div class="lfc-card-speaker">' +
                  '<img class="lfc-card-speaker-image" src="' + pastorImage + '" alt="' + msg.pastor + '">' +
                  '<p class="lfc-card-note">' + msg.pastor + '</p>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</div>'
    );
  }

  function render(messagesToRender) {
    messageGrid.innerHTML = messagesToRender.map(cardMarkup).join('');
    resultCount.textContent = 'Showing ' + messagesToRender.length + ' of ' + messages.length + ' messages';

    if (!messagesToRender.length) {
      noResults.classList.remove('lfc-hidden');
    } else {
      noResults.classList.add('lfc-hidden');
    }
  }

  function updateLatestLinks() {
    var latestMessage = messages[0];
    if (!latestMessage) {
      return;
    }

    latestMessageLinks.forEach(function (link) {
      link.href = 'single-message.html?id=' + encodeURIComponent(latestMessage.id);
    });
  }

  function filterAndRender() {
    var searchValue = searchInput.value.trim().toLowerCase();
    var yearValue = yearFilter.value;
    var monthValue = monthFilter.value;
    var pastorValue = pastorFilter.value;

    var filtered = messages.filter(function (msg) {
      var date = parseDate(msg.date);
      var matchesSearch = !searchValue || [msg.title, msg.pastor, msg.description, msg.scripture, msg.series]
        .join(' ')
        .toLowerCase()
        .indexOf(searchValue) !== -1;
      var matchesYear = !yearValue || String(date.getFullYear()) === yearValue;
      var matchesMonth = !monthValue || String(date.getMonth() + 1) === monthValue;
      var matchesPastor = !pastorValue || msg.pastor === pastorValue;

      return matchesSearch && matchesYear && matchesMonth && matchesPastor;
    });

    render(sortMessages(filtered));
  }

  function applyQueryDefaults() {
    var defaultSearch = urlParams.get('search') || '';
    var defaultPastor = urlParams.get('pastor') || '';
    var defaultYear = urlParams.get('year') || '';
    var defaultMonth = urlParams.get('month') || '';

    if (defaultSearch) {
      searchInput.value = defaultSearch;
    }
    if (defaultPastor) {
      pastorFilter.value = defaultPastor;
    }
    if (defaultYear) {
      yearFilter.value = defaultYear;
    }
    if (defaultMonth) {
      monthFilter.value = defaultMonth;
    }
  }

  function bindEventsOnce() {
    if (initialized) {
      return;
    }

    initialized = true;

    [searchInput, yearFilter, monthFilter, pastorFilter, sortFilter].forEach(function (el) {
      el.addEventListener('input', filterAndRender);
      el.addEventListener('change', filterAndRender);
    });

    searchButton.addEventListener('click', function () {
      filterAndRender();
      // Scroll to the message grid
      setTimeout(function() {
        var messageGridSection = document.querySelector('.gen-section-padding-2');
        if (messageGridSection) {
          messageGridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });

    clearFiltersBtn.addEventListener('click', function () {
      searchInput.value = '';
      yearFilter.value = '';
      monthFilter.value = '';
      pastorFilter.value = '';
      sortFilter.value = 'newest';
      filterAndRender();
    });
  }

  function initLibrary() {
    messages = (window.lfcMessages || []).slice();
    bindEventsOnce();
    updateLatestLinks();
    populateFilters();
    applyQueryDefaults();
    filterAndRender();
  }

  initLibrary();
  document.addEventListener('lfc:messages-ready', initLibrary);
})();
