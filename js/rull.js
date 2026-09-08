// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

const SL = 1;

function merRull(el) {
  const ned = el.scrollTop + el.clientHeight < el.scrollHeight - SL;
  const upp = el.scrollTop > SL;
  const hoger = el.scrollLeft + el.clientWidth < el.scrollWidth - SL;
  const vanster = el.scrollLeft > SL;
  return ned || upp || hoger || vanster;
}

function finPekare() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function upptagen(mosaik) {
  return mosaik.dataset.dra === "pa" || mosaik.dataset.skala === "pa";
}

export function kopplaRull(mosaik) {
  const pekare = document.querySelector(".rull-pekare");
  const bevakade = new WeakSet();
  const ro = new ResizeObserver((poster) => {
    poster.forEach((post) => synkaKropp(post.target));
  });

  function synkaKropp(kropp) {
    if (!kropp) {
      return;
    }
    kropp.dataset.rull = merRull(kropp) ? "ja" : "nej";
  }

  function bevakaKropp(kropp) {
    if (!kropp || bevakade.has(kropp)) {
      return;
    }
    bevakade.add(kropp);
    ro.observe(kropp);
    synkaKropp(kropp);
  }

  function doljPekare() {
    if (pekare) {
      delete pekare.dataset.tillstand;
    }
  }

  function visaPekare(x, y) {
    if (!pekare || !finPekare() || upptagen(mosaik)) {
      doljPekare();
      return;
    }
    pekare.style.setProperty("--rull-x", `${x}px`);
    pekare.style.setProperty("--rull-y", `${y}px`);
    pekare.dataset.tillstand = "synlig";
  }

  mosaik.querySelectorAll(".fonster-kropp").forEach(bevakaKropp);

  mosaik.addEventListener(
    "scroll",
    (e) => {
      if (e.target.classList?.contains("fonster-kropp")) {
        synkaKropp(e.target);
      }
    },
    true,
  );

  mosaik.addEventListener(
    "load",
    (e) => {
      if (e.target.tagName === "IMG") {
        synkaKropp(e.target.closest(".fonster-kropp"));
      }
    },
    true,
  );

  mosaik.addEventListener("pointermove", (e) => {
    if (!finPekare() || upptagen(mosaik) || e.target.closest("a, button")) {
      doljPekare();
      return;
    }
    const text = e.target.closest(".fonster-text");
    const kropp = text?.closest(".fonster-kropp");
    if (!kropp) {
      doljPekare();
      return;
    }
    bevakaKropp(kropp);
    synkaKropp(kropp);
    if (kropp.dataset.rull === "ja") {
      visaPekare(e.clientX, e.clientY);
    } else {
      doljPekare();
    }
  });

  mosaik.addEventListener("pointerleave", doljPekare);
}
