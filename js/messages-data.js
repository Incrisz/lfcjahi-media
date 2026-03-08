(function () {
  function getApiBaseUrl() {
    var configured = (
      (window.lfcRuntimeConfig && window.lfcRuntimeConfig.backendUrl) ||
      window.lfcApiBaseUrl ||
      ''
    ).replace(/\/+$/, '');
    if (configured) {
      return configured;
    }

    return window.location.origin.replace(/\/+$/, '');
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'message';
  }

  function getFileExtension(url) {
    var cleanUrl = String(url || '').split('?')[0].split('#')[0];
    var match = cleanUrl.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : 'mp3';
  }

  function getDefaultDate(item) {
    if (item.mediaDate) {
      return item.mediaDate;
    }

    if (item.createdAt) {
      return String(item.createdAt).slice(0, 10);
    }

    return new Date().toISOString().slice(0, 10);
  }

  function normalizeMessage(item, index) {
    var title = item.title || 'Untitled Message';
    var pastor = item.speaker || 'LFC Jahi';
    var date = getDefaultDate(item);
    var thumbnail = item.thumbnailUrl || 'images/background/asset-14.jpeg';
    var speakerImage = item.speakerImageUrl || thumbnail;
    var category = item.category || 'Audio';
    var mediaUrl = item.mediaUrl || '';
    var safeId = item.id || slugify(title + '-' + date + '-' + index);
    var downloadUrl = item.downloadUrl || (item.id ? (getApiBaseUrl() + '/api/media/' + item.id + '/download') : mediaUrl);
    var downloadFilename = slugify(title) + '.' + getFileExtension(mediaUrl || downloadUrl);

    return {
      id: safeId,
      title: title,
      pastor: pastor,
      date: date,
      duration: 'Available for download',
      durationMinutes: 0,
      image: thumbnail,
      speakerImage: speakerImage,
      audioUrl: mediaUrl,
      downloadUrl: downloadUrl,
      downloadFilename: downloadFilename,
      scripture: '',
      series: category,
      description: item.description || ''
    };
  }

  function selectAudioMessages(items) {
    var audioItems = items.filter(function (item) {
      return String(item.category || '').toLowerCase() === 'audio' && item.mediaUrl;
    });

    if (audioItems.length) {
      return audioItems;
    }

    return items.filter(function (item) {
      return !!item.mediaUrl;
    });
  }

  function dispatchMessagesReady() {
    document.dispatchEvent(new CustomEvent('lfc:messages-ready', {
      detail: window.lfcMessages
    }));
  }

  function dispatchMessagesError(error) {
    document.dispatchEvent(new CustomEvent('lfc:messages-error', {
      detail: error
    }));
  }

  function setMessages(items) {
    window.lfcMessages = items;
    dispatchMessagesReady();
  }

  function loadMessages() {
    var apiBaseUrl = getApiBaseUrl();
    var apiUrl = apiBaseUrl + '/api/media';

    fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load media library');
        }

        return response.json();
      })
      .then(function (payload) {
        var items = Array.isArray(payload && payload.data) ? payload.data : [];
        var normalized = selectAudioMessages(items)
          .map(normalizeMessage)
          .filter(function (item) {
            return !!item.audioUrl;
          });

        setMessages(normalized);
      })
      .catch(function (error) {
        console.error('Unable to load media library from API.', error);
        setMessages([]);
        dispatchMessagesError(error);
      });
  }

  window.lfcMessages = [];
  loadMessages();
})();
