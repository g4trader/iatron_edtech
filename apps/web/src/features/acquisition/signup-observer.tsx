'use client';
import { useEffect, useRef } from 'react';
import { emitAcquisitionEvent } from './events';
/** A visitor has started filling the existing signup form, not completed signup. */
export function SignupObserver() {
  const started = useRef(false);
  useEffect(() => {
    const onInput = (event: Event) => {
      if (
        !(event.target instanceof HTMLInputElement) ||
        !event.target.closest('form') ||
        started.current
      )
        return;
      started.current = true;
      emitAcquisitionEvent({ name: 'signup_started' });
    };
    document.addEventListener('input', onInput);
    return () => document.removeEventListener('input', onInput);
  }, []);
  return null;
}
