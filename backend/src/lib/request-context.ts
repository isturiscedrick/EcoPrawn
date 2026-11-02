import { getCookies, getRequestHeaders, setCookie } from '@tanstack/react-start/server';
// A fresh store belongs to the active Start request; never share auth state across requests.
export async function cookies() {
  const values = getCookies();
  return {
    getAll: () => Object.entries(values).map(([name, value]) => ({ name, value })),
    set: (name: string, value: string, options: Parameters<typeof setCookie>[2]) => {
      values[name] = value;
      setCookie(name, value, options);
    },
  };
}
export async function headers() { return getRequestHeaders(); }
