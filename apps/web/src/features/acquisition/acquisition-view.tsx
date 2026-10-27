'use client';
import { useEffect, useRef } from 'react';
import { emitAcquisitionEvent, type AcquisitionViewName } from './events';

export function AcquisitionView({ name }: { name: AcquisitionViewName }) {
  const emitted = useRef<AcquisitionViewName | null>(null);
  useEffect(() => {
    if (emitted.current === name) return;
    emitted.current = name;
    emitAcquisitionEvent({ name });
  }, [name]);
  return null;
}
