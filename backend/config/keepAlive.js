/**
 * Render & Cloud Keep-Alive Service
 * Prevents cloud web services (e.g. Render.com free tier) from sleeping after 15 minutes of inactivity.
 * Automatically pings /health or /api/health every 10 minutes.
 */

export const startKeepAlive = (port = 5001) => {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER_EXTERNAL_URL || process.env.RENDER === 'true';
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || process.env.BACKEND_URL;
  
  if (!isProduction && !externalUrl) {
    console.log(`⏱️ [Keep-Alive] 💤 Inactive in local development. Automatically activates in production on Render.`);
    return;
  }

  const targetUrl = externalUrl ? `${externalUrl.replace(/\/$/, '')}/health` : `http://localhost:${port}/health`;
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Render free-tier sleeps at 15m)

  console.log(`⏱️ [Keep-Alive] 🟢 Production Keep-Alive active. Pinging: ${targetUrl} every 10 mins.`);

  const pingService = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Render-KeepAlive-Bot/1.0' }
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`[Keep-Alive] 🟢 Live ping response: ${response.status} (${duration}ms) at ${new Date().toLocaleTimeString()}`);
      } else {
        console.warn(`[Keep-Alive] 🟡 Live ping returned status ${response.status} (${duration}ms)`);
      }
    } catch (error) {
      console.warn(`[Keep-Alive] ⚠️ Ping attempt to ${targetUrl} notice:`, error.message);
    }
  };

  // Initial ping 2 minutes after startup, then every 10 minutes
  setTimeout(() => {
    pingService();
    setInterval(pingService, PING_INTERVAL_MS);
  }, 2 * 60 * 1000);
};
