"use client";
import { Card } from "./ui/card";
import { KEYS, type GenomeStored } from "@/lib/user-data";
import { useLocalData } from "@/lib/use-local-data";
export default function ImportedGenome() {
  const genome = useLocalData<GenomeStored>(KEYS.genome);
  if (!genome) return null;
  return (
    <Card accent>
      <p className="text-micro uppercase tracking-widest text-sage-dark">
        Your imported calls
      </p>
      <h2 className="font-serif text-[24px] mt-1">
        {genome.matchedSnps.length} panel matches
      </h2>
      <p className="text-caption text-stone-500 mt-2 break-all">
        {genome.sourceFile || "Previous upload"} ·{" "}
        {genome.totalRows.toLocaleString()} called rows read ·{" "}
        {new Date(genome.uploadedAt).toLocaleString()}
      </p>
      <p className="text-caption text-stone-500 mt-3">
        These are raw rsID matches. Genome build, strand and clinical
        significance have not been resolved. The chromosome, risk and pathway
        explorer below continues to use demo data.
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-caption">
          <thead>
            <tr>
              {["rsID", "Gene", "Panel label", "Uploaded genotype"].map(
                (label) => (
                  <th className="p-3 text-stone-400 font-medium" key={label}>
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {genome.matchedSnps.map((row) => (
              <tr key={row.rsid} className="border-t border-cream-300">
                <td className="p-3 font-mono">{row.rsid}</td>
                <td className="p-3">{row.gene}</td>
                <td className="p-3">{row.variant}</td>
                <td className="p-3 font-mono">{row.genotype}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!genome.matchedSnps.length && (
          <p className="text-caption text-stone-500 p-3">
            No calls in this file matched the 22-record panel.
          </p>
        )}
      </div>
    </Card>
  );
}
