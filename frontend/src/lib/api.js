  import axios from "axios";

const PUBLIC_URL = process.env.PUBLIC_URL || "/Portfolio-Code";

export const WORLDS = {
  anomaly: {
    key: "anomaly",
    index: "01",
    title: "Design Anomaly",
    titleLines: ["Design", "Anomaly"],
    path: "/anomaly",
    description:
      "Experimental architecture and spatial research. Structures, installations and fragments produced by subtraction, displacement, folding and collision.",
  },
  furniture: {
    key: "furniture",
    index: "02",
    title: "Design Furniture",
    titleLines: ["Design", "Furniture"],
    path: "/furniture",
    description:
      "Objects and furniture understood as small architecture. Each piece records a single design operation — peeling, compression, splitting — made legible in material.",
  },
  work: {
    key: "work",
    index: "03",
    title: "Work",
    titleLines: ["Design", "Work"],
    description:
      "Applied practice across supervision, building design and competition entries — where architectural ideas meet real briefs, sites and constraints.",
    categories: ["Supervisor", "Building Design", "Competition Design"],
  },
};

/* =========================================================
   STATIC DATA
   ========================================================= */

const PROJECTS_URL = `${PUBLIC_URL}/data/projects.json`;

const readProjects = async () => {
  const { data } = await axios.get(PROJECTS_URL, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return Array.isArray(data) ? data : data.projects || [];
};

/* =========================================================
   PUBLIC PROJECT API
   ========================================================= */

export const fetchPublished = async (world) => {
  const projects = await readProjects();

  return projects.filter(
    (project) =>
      project.published === true &&
      (!world || project.world === world)
  );
};

export const fetchProject = async (slug) => {
  const projects = await readProjects();

  const project = projects.find(
    (item) => item.slug === slug && item.published === true
  );

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

/* =========================================================
   TEMPORARY EDITOR API
   ========================================================= */

export const getToken = () => sessionStorage.getItem("github_token");

export const setToken = (token) =>
  sessionStorage.setItem("github_token", token);

export const clearToken = () =>
  sessionStorage.removeItem("github_token");

export const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/vnd.github+json",
  },
});

/*
  These functions are intentionally temporary placeholders.

  The next step will replace them with GitHub Contents API
  operations so the editor can create/update/delete projects.
*/

export const adminLogin = async () => {
  throw new Error("Old passcode login has been disabled.");
};

export const adminVerify = async () => {
  throw new Error("GitHub authentication migration is not finished yet.");
};

export const adminFetchAll = async () => {
  return readProjects();
};

export const adminFetchBySlug = async (slug) => {
  const projects = await readProjects();
  return projects.find((project) => project.slug === slug) || null;
};

export const adminCreate = async () => {
  throw new Error("GitHub editor migration is not finished yet.");
};

export const adminUpdate = async () => {
  throw new Error("GitHub editor migration is not finished yet.");
};

export const adminDelete = async () => {
  throw new Error("GitHub editor migration is not finished yet.");
};

export const adminReorder = async () => {
  throw new Error("GitHub editor migration is not finished yet.");
};

export const adminUpload = async () => {
  throw new Error("GitHub image upload migration is not finished yet.");
};

/* =========================================================
   ABOUT
   ========================================================= */

export const fetchAbout = async () => {
  const { data } = await axios.get(`${PUBLIC_URL}/data/about.json`);
  return data;
};

export const adminUpdateAbout = async () => {
  throw new Error("GitHub About editor migration is not finished yet.");
};

export const adminChangePasscode = async () => {
  throw new Error("Passcode authentication has been removed.");
};

/* =========================================================
   HOME INTRO
   ========================================================= */

export const fetchHomeIntro = async () => {
  const { data } = await axios.get(`${PUBLIC_URL}/data/home.json`);
  return data;
};

export const adminUpdateHomeIntro = async () => {
  throw new Error("GitHub Home editor migration is not finished yet.");
};

/* =========================================================
   HELPERS
   ========================================================= */

export const pad = (n) => String(n + 1).padStart(2, "0");
