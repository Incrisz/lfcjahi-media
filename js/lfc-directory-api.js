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

  function fetchDistrictDirectory() {
    return fetch(getApiBaseUrl() + '/api/districts', {
      headers: {
        Accept: 'application/json'
      }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load district directory');
        }

        return response.json();
      })
      .then(function (payload) {
        return Array.isArray(payload && payload.data) ? payload.data : [];
      });
  }

  window.lfcDirectoryApi = {
    getApiBaseUrl: getApiBaseUrl,
    fetchDistrictDirectory: fetchDistrictDirectory
  };
})();
