import { mergeConfig } from 'vite';

export default (config: any) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        // On remplace le module Node 'path' par sa version navigateur
        path: 'path-browserify',
      },
    },
  });
};