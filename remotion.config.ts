import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Disable lazy compilation in production to avoid WebSocket/SSE errors through proxy
// Railway and similar platforms don't properly forward SSE connections
if (process.env.NODE_ENV === 'production') {
  Config.setLazyCompilation(false);
}
