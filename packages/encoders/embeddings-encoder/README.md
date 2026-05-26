# @cm2ml/embeddings-encoder

## Experimental Status

This encoder is currently experimental and may require manual setup to work reliably in local environments.

## CLI Example

```bash
# Single model
cm2ml <language>-embeddings <inputFile> \
  --out <outputFile> \
  --embeddings-model glove \
  --dimension 100 \
  --oov-strategy most-similar \
  --pretty

# Batch
cm2ml batch-<language>-embeddings <inputDir> \
  --out <outputFile> \
  --embeddings-model word2vec-google-news \
  --model-encoding \
  --pooled-model-encoding mean \
  --pretty
```

## Local Setup (Important)

This encoder requires local embeddings files and index files for CLI and batch execution.

### Download Sources

- GloVe: <https://nlp.stanford.edu/projects/glove/>
- Word2Vec: <https://code.google.com/archive/p/word2vec/>

### Why an Index Is Required

The encoder performs random-access reads on large text embeddings files.
To resolve terms efficiently, it also needs an index file with byte offsets.

### Default Files Location

By default, files are loaded from the repository-level `embeddings/` folder.

The base directory is currently hardcoded in [`src/index.ts`](./src/index.ts) (`EMBEDDINGS_BASE_DIR`).

### Expected Filenames

| `embeddingsModel` | Embeddings file | Index file |
| --- | --- | --- |
| `glove` | `glove-6B-300d.txt` | `glove-6B-300d_index.txt` |
| `word2vec-google-news` | `vectors.txt` | `vectors_index.txt` |
| `glove-mde` | `glove-mde.txt` | `glove-mde_index.txt` |
| `word2vec-mde` | `word2vec-mde.txt` | `word2vec-mde_index.txt` |

### Setup Steps

1. Download or prepare a plain-text embeddings file (`word val1 val2 ...`).
2. Place it in `embeddings/` using the exact filename expected by the selected `embeddingsModel`.
3. Generate the index using [`create_index.py`](../../../ml/util/create_index.py):

```bash
python3 ml/util/create_index.py embeddings/<embedding-file>.txt \
  -o embeddings/<embedding-file>_index.txt
```

Example:

```bash
python3 ml/util/create_index.py embeddings/vectors.txt -o embeddings/vectors_index.txt
```

4. Run the encoder with the matching `--embeddings-model`.

### Current Caveats

- `embeddingsDir` exists as a parameter but is currently not used by the implementation (needs to be fixed).
- File-based embedding lookup is only used in batch/multi-input execution. Single-input execution (`input.length === 1`) uses fallback embeddings for visualizer compatibility (since the visualizer retrieves the embeddings through the REST server).

## Available Parameters

| Parameter | Type | Default | Allowed Values | Description |
| --- | --- | --- | --- | --- |
| `includeNames` | `boolean` | `true` | - | Encode names as terms |
| `includeTypes` | `boolean` | `false` | - | Encode types as terms |
| `includedAttributes` | `list<string>` | `[]` | - | Additional attributes to encode as terms |
| `minTermLength` | `number` | `1` | - | Minimum term length |
| `maxTermLength` | `number` | `100` | - | Maximum length of terms |
| `stopWords` | `list<string>` | default stop-word list | - | List of stop words to exclude |
| `tokenize` | `boolean` | `true` | - | Split and clean terms into separate tokens (controlled by term delimiters) |
| `termDelimiters` | `list<string>` | `[' ', '-', '_']` | - | Delimiters used to split tokens |
| `lowercase` | `boolean` | `true` | - | Convert terms to lowercase |
| `stem` | `boolean` | `false` | - | Apply stemming to terms |
| `includeNodeIds` | `boolean` | `true` | - | Include node IDs in output terms |
| `embeddingsModel` | `string` | `'word2vec-google-news'` | `glove`, `word2vec-google-news`, `glove-mde`, `word2vec-mde` | The pre-trained word embedding model to use |
| `dimension` | `number` | `10` | - | The dimensionality of the embeddings |
| `oovStrategy` | `string` | `'zero'` | `zero`, `random`, `discard`, `most-similar` | The strategy to handle out-of-vocabulary (OOV) terms |
| `modelEncoding` | `boolean` | `false` | - | Encode the whole model as a single vector |
| `pooledModelEncoding` | `string` | `'mean'` | `mean`, `max` | The strategy to pool the embeddings of the model terms, if modelEncoding is enabled |
| `embeddingsDir` | `string` | `''` | - | Optional embeddings directory override (NOT WORKING CURRENTLY) |

## Development

### Installation

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

### Typecheck

```bash
pnpm check:tsc
```

## License

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/embeddings-encoder/LICENSE) - Copyright &copy; Jan Müller
