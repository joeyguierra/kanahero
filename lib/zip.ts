// A STORE-mode ZIP writer. No compression, no dependency: the JPEGs are
// already compressed, so all this has to do is frame them — local headers, a
// central directory, CRC-32, and the UTF-8 name flag.
//
// Export is the insurance policy for a trip's irreplaceable data, so it owns
// no moving parts it doesn't need.

export interface ZipEntry {
  /** path inside the archive, e.g. `captures/1757880420-3f9c.jpg` */
  name: string;
  data: Uint8Array;
}

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
/** PKZIP 2.0 — the floor for anything that reads a modern archive */
const VERSION = 20;
/** general purpose bit 11: names are UTF-8 */
const UTF8_FLAG = 0x0800;
const STORED = 0;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// MS-DOS date/time: 2-second resolution, years from 1980. Every archive still
// carries it, so it gets written honestly rather than zeroed.
function dosTime(d: Date): number {
  return (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
}

function dosDate(d: Date): number {
  return ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
}

/** Build one STORE-mode archive. Sizes are computed up front so the whole
    thing lands in a single buffer with no copying. */
export function zipStore(entries: ZipEntry[], modified: Date = new Date()): Blob {
  const encoder = new TextEncoder();
  const files = entries.map((e) => {
    const name = encoder.encode(e.name);
    return { name, data: e.data, crc: crc32(e.data), offset: 0 };
  });

  let size = 0;
  for (const f of files) {
    f.offset = size;
    size += 30 + f.name.length + f.data.length; // local header + name + payload
  }
  const centralStart = size;
  for (const f of files) size += 46 + f.name.length;
  const centralSize = size - centralStart;
  size += 22; // end of central directory

  const buf = new Uint8Array(size);
  const view = new DataView(buf.buffer);
  const time = dosTime(modified);
  const date = dosDate(modified);
  let at = 0;

  const u16 = (v: number) => {
    view.setUint16(at, v, true);
    at += 2;
  };
  const u32 = (v: number) => {
    view.setUint32(at, v, true);
    at += 4;
  };

  for (const f of files) {
    u32(LOCAL_SIG);
    u16(VERSION);
    u16(UTF8_FLAG);
    u16(STORED);
    u16(time);
    u16(date);
    u32(f.crc);
    u32(f.data.length); // compressed size — identical under STORE
    u32(f.data.length);
    u16(f.name.length);
    u16(0); // extra field length
    buf.set(f.name, at);
    at += f.name.length;
    buf.set(f.data, at);
    at += f.data.length;
  }

  for (const f of files) {
    u32(CENTRAL_SIG);
    u16(VERSION); // version made by
    u16(VERSION); // version needed
    u16(UTF8_FLAG);
    u16(STORED);
    u16(time);
    u16(date);
    u32(f.crc);
    u32(f.data.length);
    u32(f.data.length);
    u16(f.name.length);
    u16(0); // extra
    u16(0); // comment
    u16(0); // disk number
    u16(0); // internal attributes
    u32(0); // external attributes
    u32(f.offset);
    buf.set(f.name, at);
    at += f.name.length;
  }

  u32(EOCD_SIG);
  u16(0); // this disk
  u16(0); // disk with central directory
  u16(files.length);
  u16(files.length);
  u32(centralSize);
  u32(centralStart);
  u16(0); // archive comment length

  return new Blob([buf], { type: "application/zip" });
}
