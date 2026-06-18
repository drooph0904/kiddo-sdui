/**
 * Web preview variant of CampaignOverlay.
 *
 * lottie-react-native's web entry imports `@lottiefiles/dotlottie-react`, a dependency this
 * native-focused project does not ship. Metro automatically picks this `.web.tsx` file for
 * the web target, so the Lottie import never enters the web bundle. The campaign theme still
 * switches on web; only the decorative full-screen animation is skipped here. Native devices
 * use CampaignOverlay.tsx with the real Lottie animation.
 */
import React from 'react';
import type { OverlayConfig } from '../types/schema';

export function CampaignOverlay(_props: { overlay?: OverlayConfig }): React.JSX.Element | null {
  return null;
}
