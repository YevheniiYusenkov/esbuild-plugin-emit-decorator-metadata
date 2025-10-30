const isIdentStart = (c: number) =>
  (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95 || c === 36; // A-Z a-z _ $

export const hasDecoratorInBuffer = (buf: Buffer): boolean => {
  const n = buf.length;
  let i = 0;

  while (i < n) {
    const ch = buf[i];

    // // line comment
    if (ch === 47 && i + 1 < n && buf[i + 1] === 47) {
      i += 2;
      while (i < n && buf[i] !== 10 && buf[i] !== 13) i++;
      continue;
    }

    // /* block comment */
    if (ch === 47 && i + 1 < n && buf[i + 1] === 42) {
      i += 2;
      while (i + 1 < n && !(buf[i] === 42 && buf[i + 1] === 47)) i++;
      i += 2;
      continue;
    }

    // "..." | '...'
    if (ch === 34 || ch === 39) {
      const q = ch;
      i++;
      while (i < n) {
        if (buf[i] === 92) {
          i += 2;
          continue;
        } // escape
        if (buf[i] === q) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // `...` (as a string; ${...} intentionally not parsed - it's faster and safer for our task)
    if (ch === 96) {
      i++;
      while (i < n) {
        if (buf[i] === 92) {
          i += 2;
          continue;
        } // escape
        if (buf[i] === 96) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // @decorator
    if (ch === 64) {
      const next = buf[i + 1];
      if (next != null && isIdentStart(next)) return true;
    }

    i++;
  }
  return false;
};
