# @cm2ml/tree-encoder

This plugins provides a tree-bases encoder that supports feature encoding, and different tree formats.
Based on the work of [Burgueño et al.](https://link.springer.com/article/10.1007/s10270-021-00893-y) and [Weyssow et al.](https://arxiv.org/abs/2104.01642)

## CLI Example

```bash
# Single model
cm2ml <language>-tree <inputFile> \
  --out <outputFile> \
  --format local \
  --words-to-ids \
  --id-start-index 0 \
  --pretty

# Batch
cm2ml batch-<language>-tree <inputDir> \
  --out <outputFile> \
  --format global \
  --replace-node-ids \
  --pretty
```

## Available Parameters

This encoder composes the feature encoder and tree transformation pipeline, so feature and tree-specific parameters are available.

| Parameter | Type | Default | Allowed Values | Description |
| --- | --- | --- | --- | --- |
| `rawFeatures` | `boolean` | `false` | - | Do not encode any features |
| `onlyEncodedFeatures` | `boolean` | `false` | - | Only emit features that are encoded |
| `rawCategories` | `boolean` | `false` | - | Do not encode categorical features |
| `rawBooleans` | `boolean` | `false` | - | Do not encode boolean features |
| `rawNumerics` | `boolean` | `false` | - | Do not encode numeric features |
| `rawStrings` | `boolean` | `false` | - | Do not encode string features |
| `nodeFeatures` | `string` | `''` | - | Override the node features. Must be a serialization of the feature metadata |
| `edgeFeatures` | `string` | `''` | - | Override the edge features. Must be a serialization of the feature metadata |
| `format` | `string` | `'local'` | `compact`, `local`, `global` | The tree format to use |
| `replaceNodeIds` | `boolean` | `false` | - | Replace node ids with generated ids. This keeps vocabulary size small |
| `verboseFeatureValues` | `boolean` | `false` | - | Add name and type prefixes to feature values. This makes values unique across features |
| `continueOnError` | `boolean` | `false` | - | If true, the execution will continue when encountering an error |
| `wordsToIds` | `boolean` | `false` | - | Whether to convert words to ids |
| `idStartIndex` | `number` | `0` | - | The start index for the ids. Has no effect if wordsToIds is false |

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/tree-encoder/LICENSE) - Copyright &copy; Jan Müller
