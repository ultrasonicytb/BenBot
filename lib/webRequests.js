const HttpsProxyAgent = require('https-proxy-agent');

const getProxies = async () => {
    // Url to get proxies from
    const url = 'https://www.proxyscan.io/api/proxy?last_check=3800&country=fr,us&uptime=50&ping=100limit=10&type=socks4,socks5'
    // Fetch the proxies
    const response = await fetch(url);
    const body = await response.text();
    return body.split('\r\n');
}

const withoutProxyJson = async () => {
    const response = await fetch('http://ip-api.com/json').catch(() => null);
    const body = await response.text();
    return body;
}

const checkProxy = async (proxy) => {
    const proxyAgent = new HttpsProxyAgent(proxy);
    const response = await fetch('http://ip-api.com/json', { agent: proxyAgent }).catch(() => null);
    if (response == null) return;
    const body = await response.text();
    return body;
}

const checkProxies = async (proxies, base) => {
    // Check if one of the proxies works
    const results = await Promise.all(proxies.map(checkProxy));
    let errors = 0;
    let badProxies = 0;
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result == null) {
            errors++;
            continue;
        }
        if (result.isp != base.isp && result.country != base.country && result.query != base.query){
            console.log(`Proxy ${proxies[i]} works!; ISP: ${result.isp}; Country: ${result.country}; IP: ${result.query}`);
            
        }else{
            badProxies++;
        }
    }
    console.log(`Got ${errors} errors, ${badProxies} bad proxies and ${proxies.length - errors - badProxies} good proxies`);
}

const main = async () => {
    const proxies = await getProxies();
    console.log(`Got ${proxies.length} proxies`);
    const base = await withoutProxyJson();
    await checkProxies(proxies, base);
}

main();