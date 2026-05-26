# @cm2ml/triples-encoder

## CLI Example

```bash
# Single model
cm2ml <language>-triples <inputFile> \
  --out <outputFile> \
  --include-types \
  --types-as-one-hot \
  --pretty

# Batch
cm2ml batch-<language>-triples <inputDir> \
  --out <outputFile> \
  --use-word-embeddings \
  --embeddings-model glove-mde \
  --combine-words-strategy average \
  --oov-strategy most-similar \
  --pretty
```

## Available Parameters

| Parameter | Type | Default | Allowed Values | Description |
| --- | --- | --- | --- | --- |
| `includeSourceId` | `boolean` | `true` | - | Include source IDs of elements in the encoding output for traceability |
| `includeTypes` | `boolean` | `false` | - | Include type encodings for source and target |
| `typesAsNumber` | `boolean` | `false` | - | Encode types as a numerical value |
| `typesAsOneHot` | `boolean` | `false` | - | Encode types in form of one-hot vectors |
| `useWordEmbeddings` | `boolean` | `false` | - | Use pre-trained word embeddings for element names |
| `embeddingsModel` | `string` | `'glove-mde'` | `glove`, `word2vec-google-news`, `glove-mde`, `word2vec-mde` | The pre-trained word embedding model to use |
| `combineWordsStrategy` | `string` | `'average'` | `average`, `first`, `concat`, `skip` | Strategy to combine embeddings for multi-word names |
| `oovStrategy` | `string` | `'zero'` | `zero`, `random`, `discard`, `most-similar` | Strategy to handle out-of-vocabulary (OOV) terms |

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/triples-encoder/LICENSE) - Copyright &copy; Jan Müller
