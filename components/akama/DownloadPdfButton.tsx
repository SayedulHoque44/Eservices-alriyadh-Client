/**
 * "Download PDF" button for the public certificate page.
 *
 * Takes a picture of the element with id `targetId` (logo, photo, title and card)
 * exactly as the browser shows it, then puts that picture on an A4 PDF page and
 * downloads it. Because the browser itself draws the picture, the Arabic text,
 * fonts and colours come out the same as on screen.
 */
"use client";

import { useState } from "react";

type Props = { targetId: string; fileName: string };

// A4 page in PDF points (1pt = 1/72 inch) and the empty border around the content
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 24;
// CSS pixels -> PDF points (96 px per inch on screen, 72 pt per inch in PDF)
const PX_TO_PT = 72 / 96;

export default function DownloadPdfButton({ targetId, fileName }: Props) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDownload() {
    const node = document.getElementById(targetId);
    if (!node) return;

    setBusy(true);
    setFailed(false);
    try {
      // Loaded only on click, so the page itself stays light
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      // Wait for web fonts so the picture doesn't use a fallback font
      await document.fonts.ready;

      // Snapshot at 3x resolution so the text stays sharp when printed/zoomed
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Content size on screen, converted to PDF points
      let width = node.offsetWidth * PX_TO_PT;
      let height = node.offsetHeight * PX_TO_PT;

      // Shrink (never enlarge) so it fits inside the page margins
      const scale = Math.min(
        1,
        (A4_WIDTH - MARGIN * 2) / width,
        (A4_HEIGHT - MARGIN * 2) / height,
      );
      width *= scale;
      height *= scale;

      // Centred horizontally, from the top margin – like the page on screen
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      pdf.addImage(
        dataUrl,
        "PNG",
        (A4_WIDTH - width) / 2,
        MARGIN,
        width,
        height,
      );
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF download failed", err);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="rounded-md bg-[#17834a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#126b3c] disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      {failed && (
        <p className="text-xs text-red-600">
          Could not create the PDF. Please try again.
        </p>
      )}
    </div>
  );
}
