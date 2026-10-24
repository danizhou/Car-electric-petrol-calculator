import { Calculator } from "@/components/Calculator";

// Set by the GitHub Pages workflow, so the live site shows which commit it was built from.
const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7);
const BUILD_DATE = new Date().toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Rome" });

export default function HomePage() {
  return (
    <main>
      <h1>Calcolatore Costi PHEV</h1>
      <p className="subtitle">Confronto tra partenza a batteria carica e partenza a batteria scarica.</p>
      <Calculator />
      {COMMIT_SHA && (
        <footer className="version">
          Versione {COMMIT_SHA} · pubblicata il {BUILD_DATE}
        </footer>
      )}
    </main>
  );
}
