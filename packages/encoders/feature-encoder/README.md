# @cm2ml/feature-encoder

This package provides both a standalone and a composable feature encoder.

## CLI Example

```bash
# Single model
cm2ml <language>-feature-encoder <inputFile> \
  --out <outputFile> \
  --only-encoded-features \
  --pretty

# Batch
cm2ml batch-<language>-feature-encoder <inputDir> \
  --out <outputFile> \
  --raw-categories \
  --raw-booleans \
  --pretty
```

## Available Parameters

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/feature-encoder/LICENSE) - Copyright &copy; Jan Müller
