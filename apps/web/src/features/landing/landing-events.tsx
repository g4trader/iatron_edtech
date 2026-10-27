'use client';
import { useEffect, useRef } from 'react';

const events = new Set([
  'hero_primary_cta_click',
  'hero_secondary_cta_click',
  'community_cta_click',
  'career_mentoring_cta_click',
  'podcast_play_click',
  'final_cta_click',
  'platform_cta_click',
]);
/** Local, nonpersistent integration point. No provider, cookies or network requests. */
export function LandingEvents() {
  const viewed = useRef(false);
  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      window.dispatchEvent(
        new CustomEvent('iatron:landing-event', {
          detail: { name: 'lp_view' },
        }),
      );
    }
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const name = event.target
        .closest('[data-lp-event]')
        ?.getAttribute('data-lp-event');
      if (name && events.has(name))
        window.dispatchEvent(
          new CustomEvent('iatron:landing-event', { detail: { name } }),
        );
    };
    const toggle = (event: Event) => {
      if (
        event.target instanceof HTMLDetailsElement &&
        event.target.open &&
        event.target.dataset.faq
      ) {
        window.dispatchEvent(
          new CustomEvent('iatron:landing-event', {
            detail: {
              name: 'faq_interaction',
              question: event.target.dataset.faq,
            },
          }),
        );
      }
    };
    document.addEventListener('click', click);
    document.addEventListener('toggle', toggle, true);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('toggle', toggle, true);
    };
  }, []);
  return null;
}
