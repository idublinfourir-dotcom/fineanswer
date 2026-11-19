import { useEffect } from "react";

// Page <head> tags, shared by the browser (useSeo) and the build step that
// writes real HTML for the public pages (scripts/prerender.js).
export const SITE = "https://www.fineanswer.net";
const OG_IMAGE = `${SITE}/og-image.png`;
const DEFAULT = {
  title: "FineAnswer Study Abroad | Study in Ireland, UK & Australia",
  description:
    "FineAnswer Study Abroad is Bangladesh's leading study abroad consultancy. We help students get into top universities in Ireland, UK, Australia and New Zealand with expert visa guidance, scholarships, and 100% visa success rate.",
};

// Public pages pre-rendered at build time. A new entry also needs a rewrite in vercel.json.
export const PAGES = {
  "/": DEFAULT,
  "/ireland": {
    title: "Study in Ireland from Bangladesh | FineAnswer Study Abroad",
    description:
      "Study in Ireland with FineAnswer: globally ranked universities, IELTS requirements, tuition fees and post-study work options, with expert admission and visa guidance from Dhaka.",
  },
  "/uk": {
    title: "Study in the UK from Bangladesh | FineAnswer Study Abroad",
    description:
      "Study in the UK with FineAnswer: prestigious universities, IELTS requirements, tuition and living costs, scholarships and expert student visa guidance from Dhaka.",
  },
  "/australia": {
    title: "Study in Australia from Bangladesh | FineAnswer Study Abroad",
    description:
      "Study in Australia with FineAnswer: world-class universities, IELTS requirements, tuition fees, post-study work rights and expert student visa guidance from Dhaka.",
  },
  "/blog": {
    title: "Study Abroad Blog | FineAnswer Study Abroad",
    description:
      "Guides, visa updates and expert advice for Bangladeshi students planning to study in Ireland, the UK and Australia.",
  },
  "/career": {
    title: "Careers at FineAnswer and Jobs in Ireland | FineAnswer Study Abroad",
    description:
      "Open positions at FineAnswer Study Abroad, plus job boards and opportunities for students and graduates in Ireland.",
  },
  "/read-more-info": {
    title: "About FineAnswer Study Abroad | Visa and Admission Experts",
    description:
      "Guiding Bangladeshi students to world-class universities with expert visa strategies, end-to-end support and a proven track record. View our brochure.",
  },
};

export const pageSeo = (path) => ({ ...PAGES[path], path });

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const meta = (attr, key, value) => `<meta data-seo ${attr}="${key}" content="${esc(value)}">`;
// First ~155 characters of free text (blog body, story), for a meta description.
export const snippet = (s) => {
  const t = String(s ?? "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  return t.length > 155 ? `${t.slice(0, 152).replace(/\s+\S*$/, "")}...` : t;
};

export function headTags({
  title = DEFAULT.title,
  description = DEFAULT.description,
  path,
  image = OG_IMAGE,
  type = "website",
  noindex,
  jsonLd,
} = {}) {
  const url = path && SITE + path;
  return [
    `<title data-seo>${esc(title)}</title>`,
    meta("name", "description", description),
    noindex && meta("name", "robots", "noindex"),
    url && `<link data-seo rel="canonical" href="${esc(url)}">`,
    meta("property", "og:type", type),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    url && meta("property", "og:url", url),
    meta("property", "og:image", image),
    image === OG_IMAGE && meta("property", "og:image:width", "1200"),
    image === OG_IMAGE && meta("property", "og:image:height", "630"),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    // \u003c keeps a "</script>" inside the data from closing the tag
    jsonLd &&
      `<script data-seo type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");
}

function applySeo(seo) {
  document.head.querySelectorAll("[data-seo]").forEach((el) => el.remove());
  document.head.insertAdjacentHTML("beforeend", headTags(seo));
}

// Sets this page's tags; back to the site defaults when the page unmounts.
// Pass null while the page's data is still loading.
export function useSeo(seo) {
  const key = JSON.stringify(seo ?? null);
  useEffect(() => {
    const s = JSON.parse(key);
    if (!s) return;
    applySeo(s);
    return () => applySeo({});
  }, [key]);
}

// Blog URLs read /blog/<title-slug>-<id>. Only the id is used to look the post up,
// so old /blog/<id> links and renamed posts keep working.
export const slugify = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");
export const blogPath = (blog) => `/blog/${[slugify(blog.title), blog._id].filter(Boolean).join("-")}`;
export const blogIdFrom = (param) => /(?:^|-)([a-f0-9]{24})$/i.exec(param ?? "")?.[1] ?? null;
