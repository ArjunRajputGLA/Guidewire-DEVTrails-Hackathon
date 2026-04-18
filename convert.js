const { Jimp } = require('jimp');
const pngToIco = require('png-to-ico');
const fs = require('fs');

async function main() {
  const image = await Jimp.read('public/favicon.png');
  image.resize({ w: 256, h: 256 });
  await image.write('public/favicon-square.png');
  const buf = await pngToIco('public/favicon-square.png');
  fs.writeFileSync('public/favicon.ico', buf);
  console.log('Converted!');
}
main().catch(console.error);
