import React, { lazy } from 'react';
import { Composition, Folder } from 'remotion';

// Lazy load the Junr logo animation composition
const JunrLogoAnimation = lazy(
  () => import('./animations/internal/junr/logo-animation/Composition')
);

/**
 * Root component that registers all compositions for Remotion
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Client Animations */}
      <Folder name="Clients">
        {/* Client animations will be added here */}
      </Folder>

      {/* Internal Animations */}
      <Folder name="Internal">
        <Folder name="Junr">
          <Composition
            id="junr-logo-animation"
            component={JunrLogoAnimation}
            durationInFrames={180}
            fps={60}
            width={1920}
            height={1080}
            defaultProps={{
              backgroundColor: '#000000',
              logoScale: 1,
              animationType: 'bounce' as const,
            }}
          />
        </Folder>
      </Folder>

      {/* Templates */}
      <Folder name="Templates">
        {/* Reusable animation templates will be added here */}
      </Folder>
    </>
  );
};
