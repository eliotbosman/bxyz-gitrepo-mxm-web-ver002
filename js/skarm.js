// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

const KARTA = 128;
const BUKT = 0.3;

function ritaKarta() {
  const bild = document.getElementById("skarm-karta");
  if (!bild) {
    return;
  }
  const duk = document.createElement("canvas");
  duk.width = KARTA;
  duk.height = KARTA;
  const yta = duk.getContext("2d");
  if (!yta) {
    return;
  }
  const pix = yta.createImageData(KARTA, KARTA);
  const sista = KARTA - 1;
  for (let y = 0; y < KARTA; y += 1) {
    for (let x = 0; x < KARTA; x += 1) {
      const u = x / sista;
      const v = y / sista;
      const cx = u * 2 - 1;
      const cy = v * 2 - 1;
      const r2 = cx * cx + cy * cy;
      const f = 1 + BUKT * r2;
      const dx = cx * f * 0.5 + 0.5 - u;
      const dy = cy * f * 0.5 + 0.5 - v;
      const i = (y * KARTA + x) * 4;
      pix.data[i] = Math.max(0, Math.min(255, 128 + dx * 255));
      pix.data[i + 1] = Math.max(0, Math.min(255, 128 + dy * 255));
      pix.data[i + 2] = 128;
      pix.data[i + 3] = 255;
    }
  }
  yta.putImageData(pix, 0, 0);
  const url = duk.toDataURL("image/png");
  bild.setAttribute("href", url);
  bild.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
}

export function startaSkarm() {
  document.documentElement.dataset.skarm = "ror";
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  ritaKarta();
}
