import packageInfo from '../../package.json';

export const environment = {
  name: 'production',
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'http://ipv4/api/api_backend/api'
};
