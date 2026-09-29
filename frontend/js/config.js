// Determine API Base URL automatically:
// - If opened directly as a local file (file://) or different dev port (e.g. Live Server on 5500),
//   route requests to the backend server at http://localhost:3000/api.
// - If served directly from Express or a deployed server, use the relative path '/api'.
if (
  window.location.protocol === 'file:' ||
  (window.location.hostname === 'localhost' && window.location.port !== '3000' && window.location.port !== '')
) {
  window.API_BASE = 'http://localhost:3000/api';
} else {
  window.API_BASE = '/api';
}
