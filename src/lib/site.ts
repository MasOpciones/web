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
  "linkedin" | "orcid" | "medium" | "aboutMe" | "github",
  string | undefined
> = {
  linkedin: undefined,
  orcid: undefined,
  medium: undefined,
  aboutMe: undefined,
  github: undefined,
};

export const BRAND_PROFILE_URLS = {
  linkedin: "https://linkedin.com/company/masopciones",
  instagram: "https://instagram.com/masopcioness",
  medium: "https://medium.com/@másopciones",
  github: "https://github.com/MasOpciones",
};

const isDefinedUrl = (url: string | undefined): url is string => Boolean(url);

export const AUTHOR_SAME_AS = Object.values(AUTHOR_PROFILE_URLS).filter(isDefinedUrl);

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
