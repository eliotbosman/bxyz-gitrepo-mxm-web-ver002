// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

import { vaxGrupp } from "./animations.js";
import { lasLage, lasRut, lyftLager, skrivLage } from "./rut.js";

const STORLEK = {
  liten: "liten",
  stor: "stor",
};

const RORELSE = {
  vaxer: "vaxer",
  krymper: "krymper",
  anpassar: "anpassar",
};

const LAGE = {
  rut: "rut",
};

function slotFor(el) {
  return el.closest(".fonster-slot");
}

function synligaRekt(mosaik) {
  const vy = window.innerHeight;
  return [...mosaik.querySelectorAll(".fonster[data-fonster]")]
    .map((el) => ({ el, first: el.getBoundingClientRect() }))
    .filter(({ first }) => first.bottom > 0 && first.top < vy && first.width > 0);
}

function sparaVila(slot) {
  const lage = lasLage(slot);
  slot.dataset.vilaKol = String(lage.kol);
  slot.dataset.vilaRad = String(lage.rad);
  slot.dataset.vilaKspann = String(lage.kspann);
  slot.dataset.vilaRspann = String(lage.rspann);
}

function aterstallVila(slot) {
  if (!slot.dataset.vilaKol) {
    return;
  }
  skrivLage(slot, {
    kol: Number(slot.dataset.vilaKol),
    rad: Number(slot.dataset.vilaRad),
    kspann: Number(slot.dataset.vilaKspann),
    rspann: Number(slot.dataset.vilaRspann),
  });
  delete slot.dataset.vilaKol;
  delete slot.dataset.vilaRad;
  delete slot.dataset.vilaKspann;
  delete slot.dataset.vilaRspann;
}

function vaxIRuta(mosaik, slot) {
  const lage = lasLage(slot);
  const rut = lasRut(mosaik);
  const vyRader = Math.max(
    lage.rspann,
    Math.round((window.innerHeight - rut.pad * 2 + rut.gap) / Math.max(rut.radH + rut.gap, 1)),
  );
  sparaVila(slot);
  skrivLage(slot, {
    kol: lage.kol,
    rad: lage.rad,
    kspann: Math.max(1, rut.kol - lage.kol + 1),
    rspann: Math.min(Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--rad-spann-max"), 10) || 24, vyRader),
  });
}

export function skapaWm({ mosaik, onAndring }) {
  let fokusId = null;
  let vaxer = false;

  function fonstren() {
    return [...mosaik.querySelectorAll(".fonster[data-fonster]")];
  }

  function elFor(id) {
    return mosaik.querySelector(`.fonster[data-fonster="${id}"]`);
  }

  function expanderad() {
    return (
      mosaik.querySelector(`.fonster[data-lage="${LAGE.rut}"]`) ||
      mosaik.querySelector(`.fonster[data-storlek="${STORLEK.stor}"]`)
    );
  }

  function rensaRut(utom) {
    fonstren().forEach((post) => {
      if (post !== utom && post.dataset.lage === LAGE.rut) {
        delete post.dataset.lage;
      }
    });
  }

  function fokusera(id) {
    const el = elFor(id);
    if (!el) {
      return;
    }
    fokusId = id;
    const slot = slotFor(el);
    if (slot) {
      lyftLager(slot);
    }
    fonstren().forEach((post) => {
      post.dataset.fokus = post.dataset.fonster === id ? "aktiv" : "inaktiv";
    });
    onAndring?.({ fokusId });
  }

  function oppna(id) {
    const el = elFor(id);
    if (!el) {
      return;
    }
    fokusera(id);
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function lagg(slot) {
    const el = slot.querySelector(".fonster");
    if (el && !el.dataset.storlek) {
      el.dataset.storlek = STORLEK.liten;
    }
    mosaik.append(slot);
  }

  function stang(id) {
    const el = elFor(id);
    if (!el) {
      return;
    }
    if (el.dataset.lage === LAGE.rut || el.dataset.storlek === STORLEK.stor) {
      return minska(id);
    }
  }

  async function oka(id) {
    const el = elFor(id);
    if (!el || vaxer) {
      return;
    }
    if (el.dataset.lage === LAGE.rut || el.dataset.storlek === STORLEK.stor) {
      return;
    }

    fonstren().forEach((post) => {
      if (post !== el && post.dataset.storlek === STORLEK.stor) {
        post.dataset.storlek = STORLEK.liten;
        const annan = slotFor(post);
        if (annan) {
          aterstallVila(annan);
        }
      }
    });

    const poster = synligaRekt(mosaik);
    const slot = slotFor(el);
    if (slot) {
      vaxIRuta(mosaik, slot);
    }
    el.dataset.storlek = STORLEK.stor;
    fokusera(id);

    vaxer = true;
    await vaxGrupp(poster, (post) =>
      post === el ? RORELSE.vaxer : RORELSE.anpassar,
    );
    vaxer = false;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  async function minska(id) {
    const el = elFor(id);
    if (!el || vaxer) {
      return;
    }
    const rut = el.dataset.lage === LAGE.rut;
    const stor = el.dataset.storlek === STORLEK.stor;
    if (!rut && !stor) {
      return;
    }

    const poster = rut ? [{ el, first: el.getBoundingClientRect() }] : synligaRekt(mosaik);
    if (rut) {
      delete el.dataset.lage;
      delete mosaik.dataset.lage;
    }
    if (stor) {
      el.dataset.storlek = STORLEK.liten;
      const slot = slotFor(el);
      if (slot) {
        aterstallVila(slot);
      }
    }
    fokusera(id);

    vaxer = true;
    await vaxGrupp(poster, (post) =>
      post === el ? RORELSE.krymper : RORELSE.anpassar,
    );
    vaxer = false;
  }

  async function tack(id, firstRect) {
    const el = elFor(id);
    if (!el || vaxer) {
      return;
    }
    oppna(id);
    if (el.dataset.lage === LAGE.rut) {
      return;
    }

    rensaRut(el);
    fonstren().forEach((post) => {
      if (post.dataset.storlek === STORLEK.stor) {
        post.dataset.storlek = STORLEK.liten;
        const annan = slotFor(post);
        if (annan) {
          aterstallVila(annan);
        }
      }
    });

    const first = firstRect || el.getBoundingClientRect();
    mosaik.dataset.lage = LAGE.rut;
    el.dataset.lage = LAGE.rut;
    fokusera(id);

    vaxer = true;
    await vaxGrupp([{ el, first }], () => RORELSE.vaxer);
    vaxer = false;
  }

  function hamtaFokus() {
    return fokusId;
  }

  function hamtaExpanderad() {
    return expanderad();
  }

  return { oppna, stang, minska, oka, tack, fokusera, lagg, hamtaFokus, hamtaExpanderad };
}
