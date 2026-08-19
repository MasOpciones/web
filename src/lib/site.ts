export const SITE = {
  name: "MásOpciones",
  url: "https://www.masopciones.blog",
  description: "Laboratorio visual de datos, análisis y explicaciones públicas.",
};

export const AUTHOR = {
  name: "Mario Salas Sandí",
  path: "/autor/mario-salas-sandi",
  url: "https://www.masopciones.blog/autor/mario-salas-sandi",
  role: "Fundador y autor de MásOpciones",
};

export const AUTHOR_PROFILE_URLS: Record<
  "linkedin" | "orcid" | "medium" | "aboutMe" | "github" | "substack",
  string | undefined
> = {
  linkedin: "https://www.linkedin.com/in/mario-salas-sandi",
  orcid: "https://orcid.org/0009-0006-6125-5762",
  medium: "https://medium.com/@mariosalass",
  aboutMe: "https://about.me/mariosalassandi",
  github: "https://github.com/mariosalass",
  substack: "https://substack.com/@mariosalassandi",
};

export const BRAND_PROFILE_URLS = {
  linkedin: "https://linkedin.com/company/masopciones",
  instagram: "https://instagram.com/masopcioness",
  medium: "https://medium.com/@másopciones",
  github: "https://github.com/MasOpciones",
};

const isDefinedUrl = (url: string | undefined): url is string => Boolean(url);

export const AUTHOR_PROFILE_LINKS = [
  { label: "LinkedIn", url: AUTHOR_PROFILE_URLS.linkedin },
  { label: "ORCID", url: AUTHOR_PROFILE_URLS.orcid },
  { label: "Medium", url: AUTHOR_PROFILE_URLS.medium },
  { label: "About.me", url: AUTHOR_PROFILE_URLS.aboutMe },
  { label: "GitHub", url: AUTHOR_PROFILE_URLS.github },
  { label: "Substack", url: AUTHOR_PROFILE_URLS.substack },
].filter((profile): profile is { label: string; url: string } => isDefinedUrl(profile.url));

export const AUTHOR_SAME_AS = AUTHOR_PROFILE_LINKS.map((profile) => profile.url);

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).href;
}

export function isMarioSalasSandi(author?: string) {
  return !author || author === AUTHOR.name || author === "Mario Salas";
}

export function resolveAuthorName(author?: string) {
  return isMarioSalasSandi(author) ? AUTHOR.name : author ?? SITE.name;
}

export function getAuthorPersonJsonLd() {
  return {
    "@type": "Person",
    name: AUTHOR.name,
    url: AUTHOR.url,
    ...(AUTHOR_SAME_AS.length > 0 && { sameAs: AUTHOR_SAME_AS }),
  };
}

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: absoluteUrl("/"),
  sameAs: Object.values(BRAND_PROFILE_URLS),
  founder: getAuthorPersonJsonLd(),
};
