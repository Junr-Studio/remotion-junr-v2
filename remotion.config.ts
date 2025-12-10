import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Output to 'out' directory - our auth-proxy serves this at /out for downloads
Config.setOutputLocation('out/{composition}.{container}');

// Disable lazy compilation in production to avoid SSE errors through proxy
// Railway and similar platforms don't properly forward SSE connections
if (process.env.NODE_ENV === 'production') {
  Config.overrideWebpackConfig((currentConfiguration) => {
    return {
      ...currentConfiguration,
      experiments: {
        ...currentConfiguration.experiments,
        lazyCompilation: false,
      },
    };
  });
}
