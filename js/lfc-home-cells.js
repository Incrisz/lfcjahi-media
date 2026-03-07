(function () {
  var allCells = Array.isArray(window.homeCellsDirectory) ? window.homeCellsDirectory.slice() : [];
  var currentFilter = '';

  var searchInput = document.getElementById('cellSearch');
  var filterContainer = document.getElementById('districtFilters');
  var container = document.getElementById('cellsContainer');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeDistrict(item, index) {
    return {
      num: Number(item.sortOrder || item.num || index + 1),
      name: item.name || '',
      location: item.coverageAreas || item.location || '',
      pastors: Array.isArray(item.homeCellPastors) ? item.homeCellPastors : (Array.isArray(item.pastors) ? item.pastors : []),
      minister: item.homeCellMinister || item.minister || '',
      zones: Array.isArray(item.zones) ? item.zones.map(function (zone, zoneIndex) {
        return {
          name: zone.name || '',
          zoneMinister: zone.zoneMinister || '',
          cells: Array.isArray(zone.cells) ? zone.cells.map(function (cell, cellIndex) {
            return {
              sortOrder: Number(cell.sortOrder || cellIndex + 1),
              name: cell.name || '',
              address: cell.address || '',
              minister: cell.minister || '',
              phone: cell.phone || ''
            };
          }) : [],
          sortOrder: Number(zone.sortOrder || zoneIndex + 1)
        };
      }) : []
    };
  }

  function loadDistricts(items) {
    allCells = (items || []).map(normalizeDistrict).sort(function (a, b) {
      return a.num - b.num;
    });

    renderFilters();
    renderCells();
  }

  function buildPhoneLink(phone) {
    var value = String(phone || '').trim();
    var sanitized = value.replace(/[^\d+]/g, '');

    if (!sanitized || sanitized === '—') {
      return escapeHtml(value || '—');
    }

    return '<a href="tel:' + escapeHtml(sanitized) + '" style="color: var(--lfc-accent);">' + escapeHtml(value) + '</a>';
  }

  function renderFilters() {
    if (!filterContainer) {
      return;
    }

    var buttons = [
      '<button type="button" class="' + (currentFilter ? '' : 'active') + '" data-district="">All Districts</button>'
    ];

    allCells.forEach(function (district) {
      buttons.push(
        '<button type="button" class="' + (currentFilter === district.name ? 'active' : '') + '" data-district="' + escapeHtml(district.name) + '">' +
          escapeHtml(district.name + ' ' + district.num) +
        '</button>'
      );
    });

    filterContainer.innerHTML = buttons.join('');
  }

  function renderCells() {
    if (!container) {
      return;
    }

    var searchValue = searchInput ? String(searchInput.value || '').toLowerCase() : '';

    var filtered = allCells.filter(function (district) {
      var matchesDistrict = !currentFilter || district.name === currentFilter;
      if (!matchesDistrict) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        district.name.toLowerCase().indexOf(searchValue) !== -1 ||
        district.location.toLowerCase().indexOf(searchValue) !== -1 ||
        district.pastors.some(function (pastor) { return pastor.toLowerCase().indexOf(searchValue) !== -1; }) ||
        district.minister.toLowerCase().indexOf(searchValue) !== -1 ||
        district.zones.some(function (zone) {
          return (
            zone.name.toLowerCase().indexOf(searchValue) !== -1 ||
            zone.zoneMinister.toLowerCase().indexOf(searchValue) !== -1 ||
            zone.cells.some(function (cell) {
              return (
                cell.name.toLowerCase().indexOf(searchValue) !== -1 ||
                cell.address.toLowerCase().indexOf(searchValue) !== -1 ||
                cell.minister.toLowerCase().indexOf(searchValue) !== -1 ||
                cell.phone.indexOf(searchValue) !== -1
              );
            })
          );
        })
      );
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="lfc-no-results"><h5>No Home Cells Found</h5><p>Try adjusting your search or filter criteria</p></div>';
      return;
    }

    container.innerHTML = filtered.map(function (district) {
      var zonesHtml = district.zones.map(function (zone) {
        var cellsHtml = zone.cells.map(function (cell) {
          return (
            '<tr>' +
              '<td><strong>' + escapeHtml(cell.name) + '</strong></td>' +
              '<td>' + escapeHtml(cell.address) + '</td>' +
              '<td>' + escapeHtml(cell.minister) + '</td>' +
              '<td>' + buildPhoneLink(cell.phone) + '</td>' +
            '</tr>'
          );
        }).join('');

        return (
          '<div class="lfc-zone-section">' +
            '<h5>Zone: ' + escapeHtml(zone.name) + '</h5>' +
            (zone.zoneMinister ? (
              '<div class="lfc-info-group">' +
                '<span class="lfc-info-label">Zone Minister:</span>' +
                '<span class="lfc-info-value">' + escapeHtml(zone.zoneMinister) + '</span>' +
              '</div>'
            ) : '') +
            '<div class="lfc-cells-table table-responsive">' +
              '<table class="table">' +
                '<thead><tr><th>Cell Name</th><th>Address</th><th>Cell Minister</th><th>Phone</th></tr></thead>' +
                '<tbody>' + cellsHtml + '</tbody>' +
              '</table>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="lfc-cell-card" data-district="' + escapeHtml(district.name) + '">' +
          '<h4>' + escapeHtml(district.num + '. ' + district.name) + '</h4>' +
          '<div class="lfc-info-group">' +
            '<span class="lfc-info-label">Covering Areas:</span>' +
            '<span class="lfc-info-value">' + escapeHtml(district.location) + '</span>' +
          '</div>' +
          '<div class="lfc-info-group">' +
            '<span class="lfc-info-label">District Pastors:</span>' +
            '<span class="lfc-info-value">' + district.pastors.map(escapeHtml).join('<br>') + '</span>' +
          '</div>' +
          '<div class="lfc-info-group">' +
            '<span class="lfc-info-label">District Minister:</span>' +
            '<span class="lfc-info-value">' + escapeHtml(district.minister) + '</span>' +
          '</div>' +
          zonesHtml +
        '</div>'
      );
    }).join('');
  }

  if (filterContainer) {
    filterContainer.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-district]');
      if (!button) {
        return;
      }

      currentFilter = button.getAttribute('data-district') || '';
      renderFilters();
      renderCells();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', renderCells);
  }

  loadDistricts(allCells);

  if (window.lfcDirectoryApi && typeof window.lfcDirectoryApi.fetchDistrictDirectory === 'function') {
    window.lfcDirectoryApi.fetchDistrictDirectory()
      .then(function (items) {
        if (Array.isArray(items) && items.length) {
          loadDistricts(items);
        }
      })
      .catch(function (error) {
        console.error('Unable to load home cells from API.', error);
      });
  }
})();
