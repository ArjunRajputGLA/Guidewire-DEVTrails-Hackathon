const fs = require('fs');
const pngToIco = require('png-to-ico');

pngToIco('public/favicon.png')
  .then(buf => {
    fs.writeFileSync('public/favicon.ico', buf);
    console.log('Converted');
  })
  .catch(console.error);
