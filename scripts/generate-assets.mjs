import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-Node PNG encoder for solid & pattern generation
function createPng(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a]
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBody = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBody), 0);

  return Buffer.concat([len, typeBuf, data, crc]);
}

// CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Generate Icons & OGP
const iconsDir = path.resolve('public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

console.log('Generating PWA Icons & OGP image...');

// 1. Icon 192x192
const icon192 = createPng(192, 192, (x, y) => {
  const cx = 96;
  const cy = 96;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  // Rounded squircle / circle background: Primary Orange #FF9800
  if (dist < 84) {
    // Inner flower or star mark
    if (dist < 36) {
      return [255, 255, 255, 255]; // White center
    }
    if (dist < 46) {
      return [255, 82, 82, 255]; // Coral Red hanamaru
    }
    return [255, 152, 0, 255]; // Orange
  } else if (dist < 88) {
    return [230, 81, 0, 255]; // Dark orange border
  }
  return [0, 0, 0, 0]; // Transparent
});
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192);

// 2. Icon 512x512
const icon512 = createPng(512, 512, (x, y) => {
  const cx = 256;
  const cy = 256;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist < 224) {
    if (dist < 90) {
      return [255, 255, 255, 255];
    }
    if (dist < 120) {
      return [255, 82, 82, 255];
    }
    return [255, 152, 0, 255];
  } else if (dist < 236) {
    return [230, 81, 0, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512);

// 3. OGP 1200x630
const ogp = createPng(1200, 630, (x, y) => {
  // Warm gradient background with border: #FFFDF7 to #FFE082
  const ratio = (x / 1200 + y / 630) / 2;
  const r = Math.round(255 - ratio * 10);
  const g = Math.round(253 - ratio * 40);
  const b = Math.round(247 - ratio * 90);

  // Decorative border
  if (x < 16 || x >= 1184 || y < 16 || y >= 614) {
    return [255, 152, 0, 255]; // Primary orange frame
  }

  // Large center motif (Hanamaru symbol)
  const cx = 950;
  const cy = 315;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist > 140 && dist < 170) {
    return [255, 82, 82, 230]; // Outer ring
  }
  if (dist > 80 && dist < 110) {
    return [255, 82, 82, 230]; // Inner ring
  }

  return [r, g, b, 255];
});
fs.writeFileSync(path.resolve('public/ogp.png'), ogp);

console.log('Successfully generated public/icons/icon-192.png, icon-512.png, and public/ogp.png');

