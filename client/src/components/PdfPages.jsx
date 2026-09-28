import { useEffect, useState } from "react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Renders PDF pages as <img> so they display like a normal image.
// pdf.js is loaded on demand, only when a PDF is actually shown.
// ponytail: downloads the whole PDF per card; use Cloudinary image-type thumbnails if lists get large.
export default function PdfPages({ url, maxPages = Infinity, alt = "", className }) {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setPages([]);

    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      const pdf = await pdfjs.getDocument({ url }).promise;
      const rendered = [];
      for (let i = 1; i <= Math.min(pdf.numPages, maxPages); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, viewport }).promise;
        if (cancelled) return;
        rendered.push(canvas.toDataURL("image/jpeg", 0.85));
        setPages([...rendered]);
      }
    })().catch((err) => console.error("PDF preview failed:", err));

    return () => {
      cancelled = true;
    };
  }, [url, maxPages]);

  return pages.map((src, i) => (
    <img
      key={i}
      src={src}
      alt={pages.length > 1 ? `${alt} - page ${i + 1}` : alt}
      className={className}
    />
  ));
}
