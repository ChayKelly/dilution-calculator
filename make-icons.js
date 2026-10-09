// Draws a droplet icon to PNG with no dependencies
const zlib = require('zlib'), fs = require('fs');
function crc(buf) { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  c = 0xffffffff; for (const b of buf) c = t[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(s) {
  const rows = [];
  for (let y = 0; y < s; y++) { const row = [0];
    for (let x = 0; x < s; x++) {
      const u = (x + .5) / s, v = (y + .5) / s;
      let col = [17, 20, 24];
      // droplet: circle at bottom plus a tapering point at top
      const cx = .5, cy = .6, r = .2, dx = u - cx, dy = v - cy, d = Math.hypot(dx, dy);
      const inTip = v > .22 && v < cy && Math.abs(dx) < r * (v - .22) / (cy - .22) * 1.0;
      if (d < r || inTip) col = v > .6 ? [255, 179, 71] : [79, 179, 255];
      row.push(...col, 255);
    }
    rows.push(Buffer.from(row)); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(s, 0); ihdr.writeUInt32BE(s, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
for (const s of [192, 512]) fs.writeFileSync(`icon-${s}.png`, png(s));
