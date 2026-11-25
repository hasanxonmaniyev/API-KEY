// API Client helper
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path = '') => {
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (BASE_URL) {
    return `${BASE_URL.replace(/\/$/, '')}${cleanPath}`;
  }
  return cleanPath;
};

export const getFullApiUrl = (path = '') => {
  const rel = getApiUrl(path);
  if (rel.startsWith('http')) return rel;
  return `${window.location.origin}${rel}`;
};

export async function request(url, options = {}) {
  const fullUrl = getApiUrl(url);
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers: defaultHeaders
  });

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data
  };
}
