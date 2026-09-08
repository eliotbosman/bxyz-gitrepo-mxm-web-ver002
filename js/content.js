// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz

export const BILDER = [
  "assets/test/mael-test-img-2.jpg",
  "assets/test/mael-test-img-3.jpg",
  "assets/test/mael-test-img-5.jpg",
];

export const FONSTER = [
  {
    id: "personal",
    titel: "Personal",
    route: "#personal",
    kol: 1,
    rad: 1,
    kspann: 1,
    rspann: 12,
    bild: BILDER[0],
    kategori: "design",
    kropp: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>",
  },
  {
    id: "work-untitled-02",
    titel: "Untitled 02",
    route: "#work/untitled-02",
    kol: 2,
    rad: 3,
    kspann: 1,
    rspann: 11,
    bild: BILDER[1],
    kategori: "art",
    kropp: "<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>",
  },
  {
    id: "info",
    titel: "Info",
    route: "#info",
    kol: 1,
    rad: 1,
    kspann: 1,
    rspann: 8,
    kalla: "filter",
    kropp: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
  },
  {
    id: "work",
    titel: "Work",
    route: "#work",
    kol: 4,
    rad: 4,
    kspann: 1,
    rspann: 11,
    bild: BILDER[2],
    kategori: "art music design",
    kropp: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><ul><li><a href=\"#work/chambre-noire\" data-atgard=\"skrivbord/oppna\" data-fonster=\"work-chambre-noire\">Chambre Noire</a></li><li><a href=\"#work/untitled-02\" data-atgard=\"skrivbord/oppna\" data-fonster=\"work-untitled-02\">Untitled 02</a></li><li><a href=\"#work/untitled-03\" data-atgard=\"skrivbord/oppna\" data-fonster=\"work-untitled-03\">Untitled 03</a></li></ul>",
  },
  {
    id: "work-chambre-noire",
    titel: "Chambre Noire",
    route: "#work/chambre-noire",
    kol: 1,
    rad: 15,
    kspann: 1,
    rspann: 12,
    bild: BILDER[0],
    kategori: "art",
    kropp: "<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>",
  },
  {
    id: "contact",
    titel: "Contact",
    route: "#contact",
    kol: 1,
    rad: 1,
    kspann: 1,
    rspann: 8,
    kalla: "filter",
    kropp: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>",
  },
  {
    id: "work-untitled-03",
    titel: "Untitled 03",
    route: "#work/untitled-03",
    kol: 4,
    rad: 17,
    kspann: 1,
    rspann: 11,
    bild: BILDER[1],
    kategori: "music",
    kropp: "<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>",
  },
];

const viaId = new Map(FONSTER.map((post) => [post.id, post]));

export function hamta(id) {
  return viaId.get(id);
}

export function hamtaViaHash(hash) {
  const nyckel = (hash || "").replace(/^#/, "");
  if (!nyckel) {
    return null;
  }
  if (nyckel === "about") {
    return viaId.get("info") || null;
  }
  return FONSTER.find((post) => post.route === `#${nyckel}`) || null;
}

