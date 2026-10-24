import { Calculator } from "@/components/Calculator";

export default function HomePage() {
  return (
    <main>
      <h1>Calcolatore Costi PHEV</h1>
      <p className="subtitle">Confronto tra partenza a batteria carica e partenza a batteria scarica.</p>
      <Calculator />
    </main>
  );
}
