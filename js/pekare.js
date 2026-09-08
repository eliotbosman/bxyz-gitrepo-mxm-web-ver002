// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

export function kopplaPekare(mosaik) {
  mosaik.addEventListener("pointerover", (e) => {
    const yta = e.target.closest(".fonster");
    if (!yta) {
      return;
    }
    yta.dataset.pekare = "inne";
  });
  mosaik.addEventListener("pointerout", (e) => {
    const yta = e.target.closest(".fonster");
    if (!yta) {
      return;
    }
    if (e.relatedTarget && yta.contains(e.relatedTarget)) {
      return;
    }
    delete yta.dataset.pekare;
  });
}
