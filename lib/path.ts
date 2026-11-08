export function getUrl(path: string): string {
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/app')) {
      // Jika path adalah root '/'
      if (path === '/' || path === '') {
        return '/app';
      }
      return `/app${path}`;
    }
  }
  return path;
}
