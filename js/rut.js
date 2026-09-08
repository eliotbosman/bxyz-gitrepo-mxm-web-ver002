// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

function heltal(v, fallback) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

let pxCache = new Map();

function pxFranToken(namn, fallback) {
  if (pxCache.has(namn)) {
    return pxCache.get(namn);
  }
  const n = document.createElement("div");
  n.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;block-size:var(${namn})`;
  document.documentElement.append(n);
  const px = n.offsetHeight;
  n.remove();
  const v = px > 0 ? px : fallback;
  pxCache.set(namn, v);
  return v;
}

function rensaPxCache() {
  pxCache = new Map();
}

if (typeof window !== "undefined") {
  window.addEventListener("resize", rensaPxCache);
}

export function lasRut(mosaik) {
  const stil = getComputedStyle(document.documentElement);
  const kol = heltal(stil.getPropertyValue("--rut-kol"), 4);
  const yta = getComputedStyle(mosaik);
  const pad = parseFloat(yta.paddingInlineStart || yta.paddingLeft) || 0;
  const gap = parseFloat(yta.columnGap || yta.gap) || 0;
  const inner = Math.max(0, mosaik.clientWidth - pad * 2);
  const kolW = kol > 0 ? (inner - gap * (kol - 1)) / kol : inner;
  return {
    kol,
    pad,
    gap,
    kolW,
    radH: pxFranToken("--rad-hojd", 24),
  };
}

export function lasLage(slot) {
  return {
    kol: heltal(slot.style.getPropertyValue("--kol-start") || slot.dataset.kol, 1),
    rad: heltal(slot.style.getPropertyValue("--rad-start") || slot.dataset.rad, 1),
    kspann: heltal(slot.style.getPropertyValue("--kol-spann") || slot.dataset.kspann, 1),
    rspann: heltal(slot.style.getPropertyValue("--rad-spann") || slot.dataset.rspann, 4),
  };
}

export function skrivLage(slot, lage) {
  const kol = Math.max(1, lage.kol);
  const rad = Math.max(1, lage.rad);
  const kspann = Math.max(1, lage.kspann);
  const rspann = Math.max(1, lage.rspann);
  slot.style.setProperty("--kol-start", String(kol));
  slot.style.setProperty("--rad-start", String(rad));
  slot.style.setProperty("--kol-spann", String(kspann));
  slot.style.setProperty("--rad-spann", String(rspann));
  slot.dataset.kol = String(kol);
  slot.dataset.rad = String(rad);
  slot.dataset.kspann = String(kspann);
  slot.dataset.rspann = String(rspann);
}

let lagerTopp = 1;

export function lasLager(slot) {
  return heltal(slot.style.getPropertyValue("--lager") || slot.dataset.lager, 1);
}

export function skrivLager(slot, n) {
  const v = Math.max(1, n);
  lagerTopp = Math.max(lagerTopp, v);
  slot.style.setProperty("--lager", String(v));
  slot.dataset.lager = String(v);
}

export function lyftLager(slot) {
  lagerTopp += 1;
  skrivLager(slot, lagerTopp);
  slot.parentElement?.append(slot);
}

export function tabRader(slot, rut) {
  const huvud = slot.querySelector(".fonster-huvud");
  const h = huvud ? huvud.getBoundingClientRect().height : rut.radH;
  return spannUppFranHojd(h, rut, 1, 0);
}

export function hittaStapelMal(mosaik, slot, x, y) {
  const lista = document.elementsFromPoint(x, y);
  for (const n of lista) {
    const s = n.closest?.(".fonster-slot");
    if (!s || s === slot || !mosaik.contains(s)) {
      continue;
    }
    const el = s.querySelector(".fonster[data-fonster]");
    if (!el || el.dataset.lage === "rut") {
      continue;
    }
    return s;
  }
  return null;
}

export function staplaPa(slot, mal, mosaik) {
  const rut = lasRut(mosaik);
  const lage = lasLage(slot);
  const malLage = lasLage(mal);
  const tab = tabRader(mal, rut);
  skrivLage(slot, {
    ...lage,
    kol: malLage.kol,
    rad: malLage.rad + tab,
  });
  slot.dataset.stapel = "ja";
  skrivLager(slot, lasLager(mal) + 1);
}

export function cellFranPunkt(mosaik, x, y) {
  const r = mosaik.getBoundingClientRect();
  const rut = lasRut(mosaik);
  const stegX = rut.kolW + rut.gap;
  const stegY = rut.radH + rut.gap;
  const relX = x - r.left - rut.pad;
  const relY = y - r.top - rut.pad;
  const kol = Math.min(
    rut.kol,
    Math.max(1, Math.floor((relX + rut.gap / 2) / Math.max(stegX, 1)) + 1),
  );
  const rad = Math.max(1, Math.floor((relY + rut.gap / 2) / Math.max(stegY, 1)) + 1);
  return { kol, rad };
}

function narmastSpann(px, cell, gap, minSpann, maxSpann) {
  let best = minSpann;
  let bestD = Infinity;
  const max = Math.max(minSpann, maxSpann);
  for (let n = minSpann; n <= max; n += 1) {
    const matt = n * cell + (n - 1) * gap;
    const d = Math.abs(matt - px);
    if (d < bestD) {
      best = n;
      bestD = d;
    }
  }
  return best;
}

export function spannFranBredd(px, rut, maxSpann) {
  return narmastSpann(px, rut.kolW, rut.gap, 1, Math.max(1, maxSpann));
}

export function spannFranHojd(px, rut, minSpann, maxSpann) {
  return narmastSpann(px, rut.radH, rut.gap, minSpann, maxSpann);
}

export function spannUppFranHojd(px, rut, minSpann, maxSpann) {
  const steg = rut.radH + rut.gap;
  if (steg <= 0) {
    return minSpann;
  }
  const n = Math.ceil((px + rut.gap) / steg);
  const max = maxSpann > 0 ? maxSpann : n;
  return Math.min(max, Math.max(minSpann, n));
}

function synligaMosaikSlot(mosaik) {
  return [...mosaik.querySelectorAll(".fonster-slot")].filter((slot) => {
    const el = slot.querySelector(".fonster[data-fonster]");
    if (!el) {
      return false;
    }
    if (el.dataset.lage === "rut" || el.dataset.storlek === "stor") {
      return false;
    }
    return getComputedStyle(slot).display !== "none";
  });
}

export function packaInnehall(mosaik) {
  if (!mosaik || mosaik.dataset.lage === "rut") {
    return;
  }
  const rut = lasRut(mosaik);
  const slots = synligaMosaikSlot(mosaik);
  for (const slot of slots) {
    if (slot.dataset.matt === "ja") {
      continue;
    }
    const el = slot.querySelector(".fonster");
    if (!el) {
      continue;
    }
    const lage = lasLage(slot);
    const rspann = spannUppFranHojd(el.offsetHeight, rut, 3, 0);
    skrivLage(slot, { ...lage, rspann });
  }
  const perKol = new Map();
  for (const slot of slots) {
    const lage = lasLage(slot);
    const lista = perKol.get(lage.kol) || [];
    lista.push(slot);
    perKol.set(lage.kol, lista);
  }
  for (const lista of perKol.values()) {
    lista.sort((a, b) => lasLage(a).rad - lasLage(b).rad);
    let nasta = 1;
    for (const slot of lista) {
      const lage = lasLage(slot);
      if (slot.dataset.stapel === "ja") {
        nasta = Math.max(nasta, lage.rad + lage.rspann);
        continue;
      }
      const rad = Math.max(lage.rad, nasta);
      skrivLage(slot, { ...lage, rad });
      nasta = rad + lage.rspann;
    }
  }
}
