const INTERNAL_ORIGIN = 'https://iatron.invalid';
const hasUnsafeCharacters = (value: string) =>
  Array.from(value).some(
    (character) =>
      character === '\\' ||
      character.charCodeAt(0) <= 32 ||
      character.charCodeAt(0) === 127,
  );
const workspaces = [
  '/app',
  '/admin',
  '/editorial',
  '/review',
  '/review-preview',
];

/** A navigation hint, never an authorization decision. Safe in server and client code. */
export function safeReturnTo(
  value: string | null | undefined,
  fallback = '/app',
): string {
  if (
    !value ||
    value.length > 2048 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    hasUnsafeCharacters(value)
  )
    return fallback;
  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    const rawPath = value.split(/[?#]/)[0]!;
    // Paths are ASCII route identifiers. Reject encoded separators/dot-segments and normalization tricks.
    if (
      rawPath.includes('%') ||
      url.origin !== INTERNAL_ORIGIN ||
      url.pathname !== rawPath ||
      url.pathname === '/app/onboarding'
    )
      return fallback;
    if (
      !workspaces.some(
        (root) => url.pathname === root || url.pathname.startsWith(`${root}/`),
      )
    )
      return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function withReturnTo(
  path: string,
  returnTo: string | null | undefined,
) {
  const query = new URLSearchParams({ returnTo: safeReturnTo(returnTo) });
  return `${path}?${query}`;
}

export function safeCallbackDestination(value: string | null) {
  if (value?.startsWith('/redefinir-senha')) {
    try {
      const url = new URL(value, INTERNAL_ORIGIN);
      if (
        url.origin === INTERNAL_ORIGIN &&
        url.pathname === '/redefinir-senha' &&
        !hasUnsafeCharacters(value)
      ) {
        return withReturnTo(
          '/redefinir-senha',
          url.searchParams.get('returnTo'),
        );
      }
    } catch {
      /* Fall back to the authenticated workspace. */
    }
  }
  return safeReturnTo(value);
}
