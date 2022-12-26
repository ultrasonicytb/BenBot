const HttpsProxyAgent = require('https-proxy-agent');
const { format } = require("./helpers")
const mediaUrl = "https://{subdomain}{subNumber}.nhentai.net/galleries/{number}/{page}.png"
const nUrl = "https://nhentai.net/api/gallery/{number}/"


// Proxy and location check functions

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
    return JSON.parse(body);
}

const checkProxy = async (proxy) => {
    const proxyAgent = new HttpsProxyAgent(proxy);
    const response = await fetch('http://ip-api.com/json', { agent: proxyAgent }).catch(() => null);
    if (response == null) return;
    const body = await response.text().catch(() => null);
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

const checkLocation = async () => {
    const base = await withoutProxyJson();
    return base.countryCode;
}

// Request functions

const requestN = async (url) => {
    // Check if the location is US
    if (await checkLocation() != 'US') return "LocError";
    // Fetch the url
    const response = await fetch(url).catch(() => null);
    if (response == null) return "FetchError";
    return response;
}

// Only works if we can bypass the cloudflare captcha
const nExists = async (number) => {
    // Check if the doujin exists
    const formatObj = { number: number };
    // Create the url
    const url = format(nUrl, formatObj);
    // Fetch the url
    const response = await requestN(url);
    if (response == "LocError" || response == "FetchError") return response;
    
    // Check if cloudflare captcha is present
    const server = response.headers.get("Server");
    if (server == "cloudflare") return "CaptchaError";
    // Retreive the json
    const body = await response.text();
    const json = JSON.parse(body);
    // Check if the doujin exists
    if (json.error == true) return false;

    return json;
}

const mExists = async (number, page = 0, blob = false) => {
    // Check if the media exists
    const formatObj = { subdomain: "i", subNumber: 2, number: number, page: page };
    // Check if the media number exists
    if (page == 0){
        formatObj.subdomain = "t";
        formatObj.page = "cover";
    }
    // Create the url
    const url = format(mediaUrl, formatObj);
    // Fetch the url
    const response = await requestN(url);
    console.log(response)
    if (response == "LocError" || response == "FetchError") return response;

    const code = response.status;
    if (code == 200 && blob == true){
        const imageBlob = await response.blob();
        // Convert the blob to a buffer
        const buffer = await imageBlob.arrayBuffer();
        return Buffer.from(buffer);
    }
    return code == 200;
}

module.exports = { checkLocation : checkLocation, nExists : nExists, mExists : mExists };