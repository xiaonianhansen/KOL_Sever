const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/data/asset/geo/world.json';
const outputPath = path.join(__dirname, 'public', 'world.json');

console.log('Downloading world map data...');

https.get(url, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    https.get(res.headers.location, (res2) => {
      const data = [];
      res2.on('data', (chunk) => data.push(chunk));
      res2.on('end', () => {
        fs.writeFileSync(outputPath, Buffer.concat(data));
        console.log('Downloaded successfully to:', outputPath);
      });
    });
    return;
  }
  
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    fs.writeFileSync(outputPath, Buffer.concat(data));
    console.log('Downloaded successfully to:', outputPath);
  });
}).on('error', (err) => {
  console.error('Download failed:', err.message);
});