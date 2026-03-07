(function () {
  var searchInput = document.getElementById('districtSearch');
  var tableBody = document.getElementById('districtTableBody');
  var rows = tableBody ? Array.prototype.slice.call(tableBody.querySelectorAll('tr')) : [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch() {
    if (!searchInput) {
      return;
    }

    var searchValue = normalizeText(searchInput.value);

    rows.forEach(function (row) {
      var text = normalizeText(row.textContent);
      row.style.display = searchValue === '' || text.indexOf(searchValue) !== -1 ? '' : 'none';
    });
  }

  function renderDistricts(districts) {
    if (!tableBody || !Array.isArray(districts) || !districts.length) {
      return;
    }

    tableBody.innerHTML = districts.map(function (district, index) {
      return (
        '<tr>' +
          '<td>' + escapeHtml(district.sortOrder || index + 1) + '</td>' +
          '<td><strong>' + escapeHtml(district.name) + '</strong></td>' +
          '<td>' + escapeHtml(district.coverageAreas) + '</td>' +
          '<td>' + escapeHtml(district.outreachPastor) + '</td>' +
          '<td>' + escapeHtml(district.outreachMinister) + '</td>' +
          '<td>' + escapeHtml(district.outreachLocation) + '</td>' +
        '</tr>'
      );
    }).join('');

    rows = Array.prototype.slice.call(tableBody.querySelectorAll('tr'));
    applySearch();
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', applySearch);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && searchInput === document.activeElement) {
      searchInput.value = '';
      applySearch();
    }
  });

  if (window.lfcDirectoryApi && typeof window.lfcDirectoryApi.fetchDistrictDirectory === 'function') {
    window.lfcDirectoryApi.fetchDistrictDirectory()
      .then(renderDistricts)
      .catch(function (error) {
        console.error('Unable to load districts from API.', error);
      });
  }
})();
