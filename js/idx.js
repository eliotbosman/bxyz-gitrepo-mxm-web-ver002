// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

import { FONSTER, hamta, hamtaViaHash } from "./content.js";
import { skapaWm } from "./wm.js";
import { kopplaDra } from "./dra.js";
import { kopplaPekare } from "./pekare.js";
import { kopplaRull } from "./rull.js";
import { packaInnehall, skrivLage } from "./rut.js";
import { startaSkarm } from "./skarm.js";

function fonsterIdFranEl(el) {
  return el.closest("[data-fonster]")?.dataset.fonster || el.dataset.fonster;
}

function synkaHash(wm) {
  const id = wm.hamtaFokus();
  const meta = id ? hamta(id) : null;
  const hash = meta ? meta.route : "";
  if (hash !== location.hash) {
    history.replaceState(null, "", hash || `${location.pathname}${location.search}`);
  }
}

function oppnaFranHash(wm) {
  const post = hamtaViaHash(location.hash);
  if (post) {
    wm.tack(post.id);
  }
}

function byggSlot(mall, post) {
  const slot = mall.content.firstElementChild.cloneNode(true);
  const el = slot.querySelector(".fonster");
  const id = post.id;
  el.dataset.fonster = id;
  el.dataset.storlek = "liten";
  el.id = id;
  el.setAttribute("aria-labelledby", `rubrik-${id}`);
  const rubrik = el.querySelector(".fonster-rubrik");
  rubrik.id = `rubrik-${id}`;
  rubrik.textContent = post.titel;
  if (post.kategori) {
    el.dataset.kategori = post.kategori;
  }
  if (post.kalla) {
    el.dataset.kalla = post.kalla;
  }
  const kropp = el.querySelector(".fonster-kropp");
  const text = document.createElement("div");
  text.className = "fonster-text";
  text.innerHTML = post.kropp;
  kropp.replaceChildren(text);
  if (post.bild) {
    const ram = document.createElement("figure");
    ram.className = "fonster-bild";
    const img = document.createElement("img");
    img.src = post.bild;
    img.alt = "";
    img.draggable = false;
    ram.append(img);
    kropp.prepend(ram);
  }
  skrivLage(slot, {
    kol: post.kol,
    rad: post.rad,
    kspann: post.kspann,
    rspann: post.rspann,
  });
  return slot;
}

function sattFro(mall, wm) {
  FONSTER.forEach((post) => {
    wm.lagg(byggSlot(mall, post));
  });
}

function harKategori(el, namn) {
  if (!namn || namn === "alla") {
    return true;
  }
  return (el.dataset.kategori || "").split(/\s+/).includes(namn);
}

function sattFilter(mosaik, wm, namn) {
  const nu = mosaik.dataset.filter || "alla";
  if (nu === namn) {
    return;
  }
  const exp = wm.hamtaExpanderad();
  mosaik.dataset.filter = namn;
  document.querySelectorAll("#filter [data-filter]").forEach((lank) => {
    if (lank.dataset.filter === namn) {
      lank.dataset.vald = "ja";
      lank.setAttribute("aria-current", "true");
    } else {
      delete lank.dataset.vald;
      lank.removeAttribute("aria-current");
    }
  });
  if (exp && !harKategori(exp, namn)) {
    wm.minska(exp.dataset.fonster);
  }
}

function kopplaPack(mosaik) {
  let ram = 0;
  const kor = () => packaInnehall(mosaik);
  const schemalagg = () => {
    cancelAnimationFrame(ram);
    ram = requestAnimationFrame(() => {
      requestAnimationFrame(kor);
    });
  };
  mosaik.querySelectorAll(".fonster-bild img").forEach((img) => {
    if (img.complete && img.naturalHeight > 0) {
      return;
    }
    img.addEventListener("load", schemalagg);
    img.addEventListener("error", schemalagg);
  });
  schemalagg();
  document.fonts?.ready?.then(schemalagg);
  window.addEventListener("resize", schemalagg);
}

function bevakaSikt(mosaik) {
  const io = new IntersectionObserver(
    (poster) => {
      poster.forEach((post) => {
        const el = post.target;
        if (el.dataset.storlek === "stor") {
          el.dataset.sikt = "hel";
          return;
        }
        const andel = post.intersectionRatio;
        const topp = post.boundingClientRect.top;
        if (andel <= 0.02) {
          el.dataset.sikt = "ute";
        } else if (topp < 0 && andel < 0.4) {
          el.dataset.sikt = "ut";
        } else if (topp >= 0 && andel < 0.4) {
          el.dataset.sikt = "in";
        } else {
          el.dataset.sikt = "hel";
        }
      });
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );

  function bevaka(el) {
    io.observe(el);
  }

  mosaik.querySelectorAll(".fonster").forEach(bevaka);
}

function boot() {
  const mosaik = document.getElementById("mosaik");
  const mall = document.getElementById("mall-fonster");

  const wm = skapaWm({
    mosaik,
    onAndring() {
      synkaHash(wm);
      if (!wm.hamtaExpanderad()) {
        packaInnehall(mosaik);
      }
    },
  });

  startaSkarm();
  sattFro(mall, wm);
  kopplaPekare(mosaik);
  kopplaRull(mosaik);
  kopplaPack(mosaik);
  bevakaSikt(mosaik);

  const atgarder = {
    "skrivbord/oppna": (el) => {
      const id = el.dataset.fonster;
      if (id) {
        wm.tack(id, el.getBoundingClientRect());
      }
    },
    "skrivbord/hem": () => {
      const klar = () => {
        history.replaceState(null, "", `${location.pathname}${location.search}`);
      };
      const filterHem = () => {
        if (mosaik.dataset.filter && mosaik.dataset.filter !== "alla") {
          sattFilter(mosaik, wm, "alla");
        }
        klar();
      };
      const exp = wm.hamtaExpanderad();
      if (exp) {
        wm.minska(exp.dataset.fonster).then(filterHem);
        return;
      }
      filterHem();
    },
    "fonster/stang": (el) => {
      const id = fonsterIdFranEl(el);
      if (id) {
        wm.stang(id);
      }
    },
    "fonster/minska": (el) => {
      const id = fonsterIdFranEl(el);
      if (id) {
        wm.minska(id);
      }
    },
    "fonster/oka": (el) => {
      const id = fonsterIdFranEl(el);
      if (id) {
        wm.oka(id);
      }
    },
    "filter/satt": (el) => {
      const namn = el.dataset.filter || "alla";
      sattFilter(mosaik, wm, namn);
    },
  };

  const dra = kopplaDra(mosaik, {
    farDra() {
      return !wm.hamtaExpanderad();
    },
    onSlut() {
      packaInnehall(mosaik);
    },
  });

  document.addEventListener("click", (e) => {
    if (dra.varDrog()) {
      e.preventDefault();
      return;
    }
    const knapp = e.target.closest("[data-atgard]");
    if (knapp) {
      const fn = atgarder[knapp.dataset.atgard];
      if (!fn) {
        return;
      }
      if (knapp.tagName === "A") {
        e.preventDefault();
      }
      fn(knapp, e);
      return;
    }

    const expanderad = wm.hamtaExpanderad();
    const iHorn = e.target.closest(".krom, .horn, .filter");
    if (expanderad && !expanderad.contains(e.target) && !iHorn) {
      wm.minska(expanderad.dataset.fonster);
      return;
    }

    const yta = e.target.closest(".fonster[data-fonster]");
    if (!yta) {
      return;
    }
    if (e.target.closest(".fonster-skala")) {
      return;
    }
    if (yta.dataset.lage === "rut") {
      wm.fokusera(yta.dataset.fonster);
      return;
    }
    wm.tack(yta.dataset.fonster, yta.getBoundingClientRect());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") {
      return;
    }
    const expanderad = wm.hamtaExpanderad();
    if (expanderad) {
      wm.minska(expanderad.dataset.fonster);
    }
  });

  window.addEventListener("hashchange", () => oppnaFranHash(wm));

  if (location.hash) {
    oppnaFranHash(wm);
  }
}

boot();
