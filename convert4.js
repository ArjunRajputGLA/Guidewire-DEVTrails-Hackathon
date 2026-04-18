const fs = require('fs');
const icongen = require('icongen');

icongen('public/favicon-square.png')
  .then((results) => {
    fs.writeFileSync('public/favicon.ico', results);
    console.log('Icongen finished');
  })
  .catch(console.error);
