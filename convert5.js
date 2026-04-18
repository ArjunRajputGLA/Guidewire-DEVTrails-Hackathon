const fs = require('fs');
const png2icons = require('png2icons');

const input = fs.readFileSync('public/favicon-square.png');
const output = png2icons.createICO(input, png2icons.BICUBIC2, 0, false, true);

if (output) {
  fs.writeFileSync('public/favicon.ico', output);
  console.log('png2icons successfully converted favicon!');
} else {
  console.log('png2icons conversion failed');
}
