# @cm2ml/graph-encoder

This plugin provides a raw graph encoder that supports feature encoding and both adjacency lists and matrices.
Based on the work of [López et al.](https://dl.acm.org/doi/10.1145/3550355.3552461)

## CLI Example

```bash
# Single model
cm2ml <language>-raw-graph <inputFile> \
  --out <outputFile> \
  --format list \
  --weighted \
  --pretty

# Batch
cm2ml batch-<language>-raw-graph <inputDir> \
  --out <outputFile> \
  --format matrix \
  --pretty
```

## Available Parameters

This encoder composes the feature encoder and edge encoder, so both feature and graph-format parameters are available.

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
| `weighted` | `boolean` | `false` | - | Output weighted values, depending on the number of incoming edges on an edge target |
| `format` | `string` | `'list'` | `list`, `matrix` | The format of adjacency data |
| `continueOnError` | `boolean` | `false` | - | If true, the execution will continue when encountering an error |

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/graph-encoder/LICENSE) - Copyright &copy; Jan Müller
