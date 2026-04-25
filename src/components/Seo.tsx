import { useEffect } from "react";

type Props = {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: object | object[];
};

/**
 * Lightweight SEO head manager — sets <title>, meta description, canonical,
 * and an optional JSON-LD script. Cleans up JSON-LD on unmount.
 */
export const Seo = ({ title, description, canonical, jsonLd }: Props) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical ?? window.location.href;

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      script.dataset.voltloopJsonld = "1";
      document.head.appendChild(script);
    }

    return () => {
      if (script) script.remove();
    };
  }, [title, description, canonical, jsonLd]);

  return null;
};
