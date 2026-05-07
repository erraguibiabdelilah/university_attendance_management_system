import packageInfo from '../../package.json';

export const environment = {
  name: 'development',
  appVersion: packageInfo.version,
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
