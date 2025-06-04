import type { GraphModel } from "@cm2ml/ir";
import { ParameterValues } from "../../../Parameters";
import { EmbeddingsEncoder } from "@cm2ml/builtin";
import { useEncoder } from "../../useEncoder";
import { Hint } from "../../../ui/hint";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Button } from "../../../ui/button";
import { useSelection } from "../../../../lib/useSelection";
import { useEffect, useState } from "react";

export interface Props {
    model: GraphModel;
    parameters: ParameterValues;
}

export function EmbeddingsEncoding({ model, parameters }: Props) {
    const { encoding, error } = useEncoder(EmbeddingsEncoder, model, parameters)
    const setSelection = useSelection.use.setSelection();
    const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
    const [updatedEmbeddings, setUpdatedEmbeddings] = useState<Record<string, number[]>>({});
    const [updatedTerms, setUpdatedTerms] = useState<Record<string, string>>({});
    const [pooledEmbedding, setPooledEmbedding] = useState<number[] | null>(null);
    const [serverUnavailable, setServerUnavailable] = useState(false);
    
    useEffect(() => {
      const checkServer = async () => {
        try {
          const ping = await fetch("http://localhost:8080/health");
          if (!ping.ok) {
            setServerUnavailable(true);
          }
        } catch {
          setServerUnavailable(true);
        }
      };
    
      checkServer();
    }, []);
    
    useEffect(() => {
      if (!encoding?.metadata?.modelEmbeddings?.[0]?.embeddings) return;

      setUpdatedEmbeddings({});
      setUpdatedTerms({});
      setPooledEmbedding(null);

      const fetchEmbeddings = async () => {
          const terms = encoding.metadata.modelEmbeddings?.[0]?.embeddings?.map(e => e.term) || [];
          const newEmbeddings: Record<string, number[]> = {};
          const newTerms: Record<string, string> = {};

          await Promise.all(terms.map(async (term) => {
              try {
                  const embeddingsModel = parameters.embeddingsModel?.toString() ?? 'glove-mde'
                  const response = await fetch(`http://localhost:8080/embedding/${encodeURIComponent(embeddingsModel)}/${encodeURIComponent(term.toLowerCase())}`);
                  if (response.ok) {
                      const data = await response.json();
                      newEmbeddings[term] = data.embedding.slice(0, parameters.dimension as number);
                  } else if (response.status === 404 && parameters.oovStrategy === 'most-similar') {
                    const response = await fetch(`http://localhost:8080/embedding/${encodeURIComponent(embeddingsModel)}/${encodeURIComponent(term)}/similar`);
                      if (response.ok) {
                        const data = await response.json();
                        newEmbeddings[term] = data.embedding.slice(0, parameters.dimension as number);
                        newTerms[term] = data.word;
                      }
                  } else if (response.status === 404 && parameters.oovStrategy === 'discard') {
                    // TODO: discard term
                  }
              } catch (err) {
                  console.error(`Error fetching embedding for term: ${term}`, err);
              }
          }));

          setUpdatedEmbeddings(newEmbeddings);
          setUpdatedTerms(newTerms);

          if (parameters.modelEncoding) {
            const response = await fetch("http://localhost:8080/pooled", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                vectors: Object.values(newEmbeddings),
                poolingType: parameters.pooledModelEncoding?.toString() ?? "avg"
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              setPooledEmbedding(data.pooledVector);
            }
          }
      };

      fetchEmbeddings();
    }, [encoding]);


    if (error || !encoding) {
        return <Hint error={error} />
    }
    

    const { modelEmbeddings } = encoding.metadata;
    const modelData = modelEmbeddings?.[0]?.embeddings || [];
    

    const handleTermClick = (term: string, nodeId: string) => {
        setSelectedTerm(term);
        setSelection({ type: 'nodes', nodes: [nodeId], origin: 'graph' });
    };

    const getBackgroundColor = (value: number) => {
      const b = Math.round((value + 1) * 127.5);
      const g = 255 - b;
      return `rgb(0, ${g}, ${b})`;
    };

    return (
        <div className="max-h-full overflow-y-auto p-4">
          <h2 className="mb-4 text-lg font-semibold">Embeddings Encoding</h2>
          {serverUnavailable && (
            <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-800 border border-red-300">
              ⚠️ Embedding server is not available. Showing fallback embeddings from cache or original input.
            </div>
          )}
          {parameters.modelEncoding && pooledEmbedding && (
            <div className="mb-6">
              <h3 className="mb-2 text-base font-medium">Pooled Vector</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      {pooledEmbedding.map((value, i) => (
                        <td
                          key={i}
                          className="border px-2 py-1 text-center font-mono text-sm"
                          style={{ backgroundColor: getBackgroundColor(value), color: '#fff', minWidth: '50px' }}
                        >
                          {value.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  {Array.from({ length: parameters.dimension as number }, (_, i) => <TableHead key={i}>Dim {i + 1}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
              {modelData.map(({ term, nodeId, embedding }) => {
                const updatedTerm = updatedTerms[term] || term;
                const vector = updatedEmbeddings[term] || embedding;
                const missingEmbedding = !updatedEmbeddings[term];
                return (
                  <TableRow key={term} className={missingEmbedding ? 'bg-red-200' : ''}>
                    <TableCell className="border px-4 py-2">
                      <Button
                          variant="ghost"
                          className={`w-full text-left ${term === selectedTerm ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => handleTermClick(term, nodeId)}
                      >
                        {updatedTerm}
                      </Button>
                    </TableCell>
                    {vector.map((value, i) => (
                    <TableCell
                      key={i}
                      className="border px-0 py-0 text-center"
                      style={{ backgroundColor: getBackgroundColor(value), color: '#fff' }}
                    >
                      {value.toFixed(2)}
                    </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </div>
        </div>
    );
}
