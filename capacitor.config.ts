import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.julza404.maximus',
  appName: 'Maximus',
  webDir: 'out',
  server: {
    url: 'https://maximus-six.vercel.app',
    cleartext: false,
  },
};

export default config;
