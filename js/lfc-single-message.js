(function () {
  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get('id');
  var initialized = false;

  function parseDate(value) {
    return new Date(value + 'T00:00:00');
  }

  function formatDate(value) {
    return parseDate(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  }

  function setAttr(id, attr, value) {
    var el = document.getElementById(id);
    if (el) {
      el.setAttribute(attr, value);
    }
  }

  function renderEmptyState() {
    if (initialized) {
      return;
    }

    initialized = true;
    setText('messageTitle', 'No message found');
    setText('messageDescription', 'No published audio message is available yet.');
    setText('messagePastorChip', 'LFC Jahi');
    setText('metaPastor', 'LFC Jahi');
    setText('messageDate', '-');
    setText('metaDate', '-');
    setText('messageDuration', '-');
    setText('metaDuration', '-');
    setText('messageScripture', '-');
    setText('messageSeries', '-');
  }

  function initSingleMessagePage() {
    var messages = (window.lfcMessages || []).slice();
    var sorted = messages.sort(function (a, b) {
      return parseDate(b.date) - parseDate(a.date);
    });

    var currentMessage = sorted.find(function (msg) {
      return msg.id === requestedId;
    }) || sorted[0];

    if (!currentMessage) {
      renderEmptyState();
      return;
    }

    initialized = true;

    setText('pageTitle', currentMessage.title + ' | LFC-JAHI MEDIA');
    document.title = currentMessage.title + ' | LFC-JAHI MEDIA';

    setText('messageTitle', currentMessage.title);
    setText('messagePastorChip', currentMessage.pastor);
    setText('metaPastor', currentMessage.pastor);
    setText('messageDate', formatDate(currentMessage.date));
    setText('metaDate', formatDate(currentMessage.date));
    setText('messageDuration', currentMessage.duration);
    setText('metaDuration', currentMessage.duration);
    setText('messageScripture', currentMessage.scripture || '-');
    setText('messageSeries', currentMessage.series || '-');
    setText('messageDescription', currentMessage.description || 'No description available.');

    setAttr('messageImage', 'src', currentMessage.image);
    setAttr('messageImage', 'alt', currentMessage.title);
    setAttr('audioPlayer', 'src', currentMessage.audioUrl);

    var downloadBtn = document.getElementById('downloadMessage');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        var url = currentMessage.downloadUrl || currentMessage.audioUrl;
        var filename = currentMessage.id + '.mp3';
        
        if (!url) {
          console.error('No download URL available');
          return false;
        }
        
        // Always use XHR blob download for reliability
        directDownload(url, filename);
        
        return false;
      });
    }
    
    function directDownload(url, filename) {
      // Use XMLHttpRequest as fallback for better compatibility
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (xhr.status === 200) {
          var blob = xhr.response;
          var blobUrl = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } else {
          console.error('Download failed with status:', xhr.status);
          alert('Download failed. Please try again.');
        }
      };
      xhr.onerror = function() {
        console.error('XHR download failed');
        alert('Download failed. Please try again.');
      };
      xhr.send();
    }

    var shareBtn = document.getElementById('copyMessageLink');
    if (shareBtn && !shareBtn.dataset.bound) {
      shareBtn.dataset.bound = 'true';
      shareBtn.addEventListener('click', function () {
        var url = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(currentMessage.id);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            shareBtn.innerHTML = '<span class=\"text\">Link Copied</span>';
            setTimeout(function () {
              shareBtn.innerHTML = '<span class=\"text\">Copy Message Link</span>';
            }, 2000);
          });
        }
      });
    }

    var browseByPastor = document.getElementById('browseByPastor');
    if (browseByPastor) {
      browseByPastor.href = 'index.html?pastor=' + encodeURIComponent(currentMessage.pastor);
    }

    var relatedContainer = document.getElementById('relatedMessages');
    if (relatedContainer) {
      var related = sorted.filter(function (msg) {
        return msg.id !== currentMessage.id;
      }).slice(0, 4);

      relatedContainer.innerHTML = related.map(function (msg) {
        return (
          '<div class="col-xl-3 col-lg-4 col-md-6 mb-4">' +
            '<a class="lfc-card-link" href="single-message.html?id=' + encodeURIComponent(msg.id) + '">' +
              '<div class="gen-carousel-movies-style-1 movie-grid style-1">' +
                '<div class="gen-movie-contain">' +
                  '<div class="gen-movie-img">' +
                    '<img src="' + msg.image + '" alt="' + msg.title + '">' +
                    '<div class="gen-movie-action"><span class="gen-button"><i class="fa fa-play"></i></span></div>' +
                  '</div>' +
                  '<div class="gen-info-contain">' +
                    '<div class="gen-movie-info"><h3>' + msg.title + '</h3></div>' +
                    '<div class="gen-movie-meta-holder"><ul><li>' + msg.duration + '</li><li><span>' + formatDate(msg.date) + '</span></li></ul></div>' +
                    '<p class="lfc-card-note">' + msg.pastor + '</p>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</a>' +
          '</div>'
        );
      }).join('');
    }
  }

  initSingleMessagePage();
  document.addEventListener('lfc:messages-ready', initSingleMessagePage);
})();
