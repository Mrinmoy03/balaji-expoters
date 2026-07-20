const https = require('https');
const urls = [
  'https://www.instagram.com/reel/DR_yxB3jAca/',
  'https://www.instagram.com/reel/DWgpB1DDFL0/',
  'https://www.instagram.com/reel/DV3sQLBjOWG/',
  'https://www.instagram.com/reel/DSNNeeDDJqe/'
];

urls.forEach(url => {
  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      console.log(url, '=> Redirected to', res.headers.location);
      return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const match = data.match(/<meta property="og:image" content="([^"]+)"/);
      if (match) {
        // Need to replace HTML entities like &amp; with &
        const imgUrl = match[1].replace(/&amp;/g, '&');
        console.log(url, '=>', imgUrl);
      } else {
        console.log(url, '=>', 'No og:image found. Status:', res.statusCode);
      }
    });
  }).on('error', err => console.error(err));
});
