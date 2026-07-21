interface BypassEnvironment {
  NODE_ENV?: string;
  E2E_AUTH_BYPASS?: string;
}

let warningEmitted = false;

export function isAuthBypassEnabled(environment: BypassEnvironment): boolean {
  const enabled =
    environment.NODE_ENV !== 'production' &&
    environment.E2E_AUTH_BYPASS === '1';
  if (enabled && !warningEmitted) {
    warningEmitted = true;
    console.warn(
      '[security] E2E authentication bypass is active in a non-production process.',
    );
  }
  return enabled;
}
