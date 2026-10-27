'use client';
import { useEffect } from 'react';
import { AcquisitionView } from '@/features/acquisition/acquisition-view';

const events = new Set([
  'hero_secondary_cta_click',
  'community_cta_click',
  'career_mentoring_cta_click',
  'podcast_play_click',
]);
/** Local, nonpersistent integration point. No provider, cookies or network requests. */
export function LandingEvents() {
  useEffect(() => {
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
  return <AcquisitionView name="landing_page_view" />;
}
