import React, { lazy } from 'react';
import { Composition, Folder } from 'remotion';

// Lazy load the internal logo animation composition
const GradientWipeLogoAnimation = lazy(
  () => import('./animations/internal/logo-animation/Composition')
);

/**
 * Root component that registers all compositions for Remotion
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Internal Animations */}
      <Folder name="Internal">
        <Composition
          id="logo-animation-junr-default"
          component={GradientWipeLogoAnimation}
          durationInFrames={180}
          fps={60}
          width={1080}
          height={1080}
          defaultProps={{
            backgroundColor: '#F9F5F3',
            logoScale: 1,
            revealDuration: 90,
            holdDuration: 60,
            exitDuration: 30,
          }}
        />
      </Folder>
    </>
  );
};
