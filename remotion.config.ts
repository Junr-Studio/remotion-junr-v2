import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Disable lazy compilation to avoid WebSocket errors through proxy
Config.setLazyCompilation(false);
