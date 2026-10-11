import dns from 'dns';

// Only override DNS on local dev machines where ISP DNS may fail SRV queries.
// On cloud providers (Render, AWS, Vercel), use native container DNS resolvers.
if (!process.env.RENDER && !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    if (dns.promises && dns.promises.setServers) {
      dns.promises.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    }
  } catch (e) {
    console.warn('Could not set custom DNS servers:', e.message);
  }
}
