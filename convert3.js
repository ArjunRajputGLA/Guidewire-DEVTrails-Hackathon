const sharp = require('sharp');
const fs = require('fs');

async function processIcon() {
  await sharp('public/favicon.png')
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFormat('png')
    .toFile('public/favicon-square.png');
  console.log('Squared PNG created!');
}

processIcon().catch(console.error);
