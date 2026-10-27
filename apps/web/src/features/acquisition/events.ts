export type AcquisitionViewName =
  | 'landing_page_view'
  | 'diagnostic_entry_view'
  | 'diagnostic_result_viewed'
  | 'study_path_opened';
export type DiagnosticCtaLocation = 'header' | 'hero' | 'platform' | 'final';
export type AcquisitionEvent =
  | {
      name:
        | AcquisitionViewName
        | 'signup_started'
        | 'diagnostic_started'
        | 'diagnostic_completed';
    }
  | {
      name: 'diagnostic_cta_click';
      cta_location: DiagnosticCtaLocation;
      user_auth_state: 'unknown' | 'authenticated' | 'unauthenticated';
    };

/** No storage, identifiers, network or analytics provider. Only confirmed actions call mutations. */
export function emitAcquisitionEvent(event: AcquisitionEvent) {
  if (typeof window === 'undefined') return;
  const detail =
    event.name === 'diagnostic_cta_click'
      ? {
          name: event.name,
          cta_location: event.cta_location,
          user_auth_state: event.user_auth_state,
        }
      : { name: event.name };
  window.dispatchEvent(new CustomEvent('iatron:acquisition-event', { detail }));
}
