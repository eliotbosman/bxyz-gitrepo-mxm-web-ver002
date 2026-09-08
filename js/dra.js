// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

import { vaxGrupp } from "./animations.js";
import {
  cellFranPunkt,
  hittaStapelMal,
  lasLage,
  lasRut,
  lyftLager,
  skrivLage,
  spannFranBredd,
  spannFranHojd,
  staplaPa,
} from "./rut.js";

const TROSKEL = 8;
const RAD_MIN = 3;

function slotFor(el) {
  return el.closest(".fonster-slot");
}

function rensaMarkering() {
  const sel = window.getSelection?.();
  if (sel && sel.rangeCount) {
    sel.removeAllRanges();
  }
}

function rullSida(dy) {
  const falt = document.querySelector(".skarm-falt");
  if (falt) {
    falt.scrollTop += dy;
    return;
  }
  window.scrollBy(0, dy);
}

function rensaLyft(el) {
  delete el.dataset.dra;
  delete el.dataset.skala;
  el.style.removeProperty("--dra-x");
  el.style.removeProperty("--dra-y");
  el.style.removeProperty("--dra-w");
  el.style.removeProperty("--dra-h");
  const sl = slotFor(el);
  sl?.style.removeProperty("--dra-h");
}

function lasKantZon() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--kant-zon").trim();
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 12;
}

function lasKant(el, x, y) {
  const r = el.getBoundingClientRect();
  const z = Math.min(lasKantZon(), r.width / 3, r.height / 3);
  const vanster = x >= r.left - z && x <= r.left + z;
  const hoger = x >= r.right - z && x <= r.right + z;
  const topp = y >= r.top - z && y <= r.top + z;
  const botten = y >= r.bottom - z && y <= r.bottom + z;
  const delar = [];
  if (vanster) {
    delar.push("vanster");
  }
  if (hoger) {
    delar.push("hoger");
  }
  if (topp) {
    delar.push("topp");
  }
  if (botten) {
    delar.push("botten");
  }
  return delar.join("-");
}

function axelFranKant(kant) {
  return {
    vanster: kant.includes("vanster"),
    hoger: kant.includes("hoger"),
    topp: kant.includes("topp"),
    botten: kant.includes("botten"),
  };
}

function lasMaxRad() {
  const n = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--rad-spann-max").trim(),
    10,
  );
  return Number.isFinite(n) && n > 0 ? n : 24;
}

function lasPx(el, namn) {
  const n = Number.parseFloat(el.style.getPropertyValue(namn));
  return Number.isFinite(n) ? n : 0;
}

function minRuta(rut) {
  return {
    w: rut.kolW,
    h: RAD_MIN * rut.radH + (RAD_MIN - 1) * rut.gap,
  };
}

function placera(mosaik, slotEl, x, y) {
  const lage = lasLage(slotEl);
  const rut = lasRut(mosaik);
  const cell = cellFranPunkt(mosaik, x, y);
  const kol = Math.min(Math.max(1, cell.kol), Math.max(1, rut.kol - lage.kspann + 1));
  const rad = Math.max(1, cell.rad);
  if (kol === lage.kol && rad === lage.rad) {
    return false;
  }
  skrivLage(slotEl, { ...lage, kol, rad });
  return true;
}

function snappaSkala(mosaik, slotEl, startLage, axel, left, top, w, h) {
  const rut = lasRut(mosaik);
  const ny = { ...startLage };
  if (axel.vanster) {
    ny.kol = cellFranPunkt(mosaik, left, top + h / 2).kol;
  }
  if (axel.topp) {
    ny.rad = cellFranPunkt(mosaik, left + w / 2, top).rad;
  }
  if (axel.vanster || axel.hoger) {
    ny.kspann = spannFranBredd(w, rut, Math.max(1, rut.kol - ny.kol + 1));
  }
  if (axel.topp || axel.botten) {
    ny.rspann = spannFranHojd(h, rut, RAD_MIN, lasMaxRad());
  }
  skrivLage(slotEl, ny);
}

export function kopplaDra(mosaik, { farDra, onSlut } = {}) {
  let lyft = null;
  let slot = null;
  let ox = 0;
  let oy = 0;
  let startX = 0;
  let startY = 0;
  let startBredd = 0;
  let startHojd = 0;
  let startLeft = 0;
  let startTop = 0;
  let startLage = null;
  let startKant = "";
  let aktiv = false;
  let drog = false;
  let doljKlick = false;
  let pekId = null;
  let lage = "";
  let axel = { vanster: false, hoger: false, topp: false, botten: false };

  function rensaKant() {
    mosaik.querySelectorAll("[data-kant]").forEach((n) => {
      delete n.dataset.kant;
    });
    delete mosaik.dataset.kant;
  }

  function synligaPoster() {
    return [...mosaik.querySelectorAll(".fonster[data-fonster]")]
      .map((n) => ({ el: n, first: n.getBoundingClientRect() }))
      .filter(({ first }) => first.width > 0 && first.height > 0);
  }

  function startaFri(e, som) {
    drog = true;
    doljKlick = true;
    rensaMarkering();
    lyft.style.setProperty("--dra-w", `${startBredd}px`);
    lyft.style.setProperty("--dra-h", `${startHojd}px`);
    lyft.style.setProperty("--dra-x", `${startLeft}px`);
    lyft.style.setProperty("--dra-y", `${startTop}px`);
    slot.style.setProperty("--dra-h", `${startHojd}px`);
    if (som === "skala") {
      mosaik.dataset.skala = "pa";
      mosaik.dataset.kant = startKant;
      lyft.dataset.skala = "pa";
      lyft.dataset.kant = startKant;
    } else {
      mosaik.dataset.dra = "pa";
      lyft.dataset.dra = "lyft";
    }
    try {
      lyft.setPointerCapture(e.pointerId);
    } catch {}
  }

  function rorLyft(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!drog) {
      if (dx * dx + dy * dy < TROSKEL * TROSKEL) {
        return;
      }
      startaFri(e, "lyft");
    }
    lyft.style.setProperty("--dra-x", `${e.clientX - ox}px`);
    lyft.style.setProperty("--dra-y", `${e.clientY - oy}px`);
    if (e.cancelable) {
      e.preventDefault();
    }
    rensaMarkering();
    if (e.clientY < 48) {
      rullSida(-16);
    } else if (e.clientY > window.innerHeight - 48) {
      rullSida(16);
    }
  }

  function rorSkala(e) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!drog) {
      if (dx * dx + dy * dy < TROSKEL * TROSKEL) {
        return;
      }
      startaFri(e, "skala");
    }
    if (e.cancelable) {
      e.preventDefault();
    }
    rensaMarkering();
    const rut = lasRut(mosaik);
    const min = minRuta(rut);
    let left = startLeft;
    let top = startTop;
    let w = startBredd;
    let h = startHojd;
    if (axel.vanster) {
      w = startBredd - dx;
      left = startLeft + dx;
    }
    if (axel.hoger) {
      w = startBredd + dx;
    }
    if (axel.topp) {
      h = startHojd - dy;
      top = startTop + dy;
    }
    if (axel.botten) {
      h = startHojd + dy;
    }
    if (w < min.w) {
      if (axel.vanster) {
        left = startLeft + startBredd - min.w;
      }
      w = min.w;
    }
    if (h < min.h) {
      if (axel.topp) {
        top = startTop + startHojd - min.h;
      }
      h = min.h;
    }
    lyft.style.setProperty("--dra-x", `${left}px`);
    lyft.style.setProperty("--dra-y", `${top}px`);
    lyft.style.setProperty("--dra-w", `${w}px`);
    lyft.style.setProperty("--dra-h", `${h}px`);
  }

  function ror(e) {
    if (!aktiv || e.pointerId !== pekId || !lyft || !slot) {
      return;
    }
    if (lage === "skala") {
      rorSkala(e);
      return;
    }
    rorLyft(e);
  }

  async function slapp(e) {
    if (!aktiv || (pekId != null && e.pointerId !== pekId)) {
      return;
    }
    const mode = lage;
    const el = lyft;
    const sl = slot;
    const slappAxel = axel;
    const slappStart = startLage;
    aktiv = false;
    pekId = null;
    lage = "";
    axel = { vanster: false, hoger: false, topp: false, botten: false };
    startLage = null;
    startKant = "";
    lyft = null;
    slot = null;
    window.removeEventListener("pointermove", ror);
    window.removeEventListener("pointerup", slapp);
    window.removeEventListener("pointercancel", slapp);
    delete mosaik.dataset.dra;
    delete mosaik.dataset.skala;
    delete mosaik.dataset.kant;
    if (!el) {
      return;
    }
    if (!drog) {
      delete el.dataset.skala;
      return;
    }
    const poster = synligaPoster();
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
    if (mode === "skala" && sl && slappStart) {
      sl.dataset.matt = "ja";
      snappaSkala(
        mosaik,
        sl,
        slappStart,
        slappAxel,
        lasPx(el, "--dra-x"),
        lasPx(el, "--dra-y"),
        lasPx(el, "--dra-w"),
        lasPx(el, "--dra-h"),
      );
    }
    if (mode === "lyft" && sl) {
      const mal = hittaStapelMal(mosaik, sl, e.clientX, e.clientY);
      if (mal) {
        staplaPa(sl, mal, mosaik);
      } else {
        delete sl.dataset.stapel;
        placera(mosaik, sl, lasPx(el, "--dra-x"), lasPx(el, "--dra-y"));
      }
    }
    rensaLyft(el);
    window.setTimeout(() => {
      doljKlick = false;
    }, 80);
    await vaxGrupp(poster, (n) => (n === el ? "krymper" : "anpassar"));
    onSlut?.();
  }

  mosaik.addEventListener("pointerdown", (e) => {
    if (e.button != null && e.button !== 0) {
      return;
    }
    if (e.target.closest("[data-atgard], a, button")) {
      return;
    }
    const el = e.target.closest(".fonster[data-fonster]");
    if (!el) {
      return;
    }
    if (el.dataset.lage === "rut" || el.dataset.storlek === "stor") {
      return;
    }
    if (farDra && !farDra(el)) {
      return;
    }
    const sl = slotFor(el);
    if (!sl) {
      return;
    }
    const kant = e.target.closest(".fonster-skala")
      ? "hoger-botten"
      : lasKant(el, e.clientX, e.clientY);
    aktiv = true;
    drog = false;
    pekId = e.pointerId;
    lyft = el;
    slot = sl;
    lyftLager(sl);
    startX = e.clientX;
    startY = e.clientY;
    startLage = lasLage(sl);
    startKant = kant;
    const r = el.getBoundingClientRect();
    startLeft = r.left;
    startTop = r.top;
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    startBredd = r.width;
    startHojd = r.height;
    if (kant) {
      lage = "skala";
      axel = axelFranKant(kant);
    } else {
      lage = "lyft";
      axel = { vanster: false, hoger: false, topp: false, botten: false };
    }
    rensaMarkering();
    window.addEventListener("pointermove", ror, { passive: false });
    window.addEventListener("pointerup", slapp);
    window.addEventListener("pointercancel", slapp);
  });

  mosaik.addEventListener("pointermove", (e) => {
    if (aktiv) {
      return;
    }
    if (e.target.closest("[data-atgard], a, button")) {
      rensaKant();
      return;
    }
    const el = e.target.closest(".fonster[data-fonster]");
    rensaKant();
    if (!el || el.dataset.lage === "rut" || el.dataset.storlek === "stor") {
      return;
    }
    const kant = e.target.closest(".fonster-skala")
      ? "hoger-botten"
      : lasKant(el, e.clientX, e.clientY);
    if (kant) {
      el.dataset.kant = kant;
    }
  });

  mosaik.addEventListener("pointerleave", () => {
    if (!aktiv) {
      rensaKant();
    }
  });

  document.addEventListener("selectstart", (e) => {
    if (aktiv || mosaik.dataset.dra === "pa" || mosaik.dataset.skala === "pa") {
      e.preventDefault();
    }
  });

  return {
    varDrog() {
      if (doljKlick) {
        doljKlick = false;
        return true;
      }
      return false;
    },
  };
}
