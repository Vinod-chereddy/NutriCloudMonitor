import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  // Also configure promises resolver if available
  if (dns.promises && dns.promises.setServers) {
    dns.promises.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (e) {
  console.warn('Could not set custom DNS servers:', e.message);
}
