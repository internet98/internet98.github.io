"use strict";

(() => {
  // 16 classic base colors plus a 6x6x6 RGB color cube and grayscale.
  // This is a DOS/VGA-inspired palette, not a claim that every VGA card
  // used precisely this same palette.
  const base = [
    [0,0,0],[128,0,0],[0,128,0],[128,128,0],
    [0,0,128],[128,0,128],[0,128,128],[192,192,192],
    [128,128,128],[255,0,0],[0,255,0],[255,255,0],
    [0,0,255],[255,0,255],[0,255,255],[255,255,255]
  ];

  const palette = [...base];
  const levels = [0, 51, 102, 153, 204, 255];

  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        if (palette.length < 232) palette.push([r, g, b]);
      }
    }
  }

  for (let i = 0; i < 24; i++) {
    const value = Math.round(i * 255 / 23);
    palette.push([value, value, value]);
  }

  palette.length = 256;

  function nearestColor(r, g, b) {
    let best = palette[0];
    let bestDistance = Infinity;

    // Weighted RGB distance approximates human color sensitivity.
    for (const color of palette) {
      const dr = r - color[0];
      const dg = g - color[1];
      const db = b - color[2];
      const distance = 0.30 * dr * dr +
                       0.59 * dg * dg +
                       0.11 * db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = color;
      }
    }
    return best;
  }

  function convert(imageData, useDither = true) {
    const { data, width, height } = imageData;
    const pixels = new Uint8ClampedArray(data);

    const index = (x, y) => (y * width + x) * 4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = index(x, y);
        const old = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const chosen = nearestColor(...old);

        pixels[i] = chosen[0];
        pixels[i + 1] = chosen[1];
        pixels[i + 2] = chosen[2];

        if (useDither) {
          const error = [
            old[0] - chosen[0],
            old[1] - chosen[1],
            old[2] - chosen[2]
          ];

          function spread(nx, ny, factor) {
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
            const ni = index(nx, ny);
            for (let c = 0; c < 3; c++) {
              pixels[ni + c] = Math.max(0, Math.min(255,
                pixels[ni + c] + error[c] * factor));
            }
          }

          spread(x + 1, y, 7 / 16);
          spread(x - 1, y + 1, 3 / 16);
          spread(x, y + 1, 5 / 16);
          spread(x + 1, y + 1, 1 / 16);
        }
      }
    }

    return new ImageData(pixels, width, height);
  }

  window.Internet98Palette = {
    colors: palette,
    convert
  };
})();