# @cm2ml/bag-of-paths-encoder

This package provides a Bag-of-Paths encoder with configurable textual representations of paths.
Based on the work of [Ali and Bork](https://link.springer.com/chapter/10.1007/978-3-031-61057-8_7).

## CLI Example

```bash
# Single model
cm2ml <language>-bag-of-paths <inputFile> \
  --out <outputFile> \
  --min-path-length 2 \
  --max-path-length 3 \
  --path-weight step-sum \
  --pretty

# Batch
cm2ml batch-<language>-bag-of-paths <inputDir> \
  --out <outputFile> \
  --order desc \
  --prune-method none \
  --pretty
```

## Available Parameters

| Parameter | Type | Default | Allowed Values | Description |
| --- | --- | --- | --- | --- |
| `stepWeighting` | `list<string>` | `['1']` | - | Custom weighting strategies |
| `nodeTemplates` | `list<string>` | `['{{name}}.{{type}}']` | - | Template for encoding nodes of paths |
| `edgeTemplates` | `list<string>` | `['{{tag}}']` | - | Template for encoding edges of paths |
| `allowCycles` | `boolean` | `false` | - | Allow cycles in paths |
| `minPathLength` | `number` | `2` | - | Minimum path length |
| `maxPathLength` | `number` | `3` | - | Maximum path length |
| `maxPaths` | `number` | `10` | - | Maximum number of paths to collect |
| `minPathWeight` | `number` | `0` | - | Minimum weight of paths |
| `maxPathWeight` | `number` | `9007199254740991` | - | Maximum weight of paths |
| `order` | `string` | `'desc'` | `asc`, `desc` | Ordering of paths according to their weight |
| `pathWeight` | `string` | `'step-sum'` | `step-sum`, `length`, `step-product` | Weighting strategy for paths |
| `pruneMethod` | `string` | `'none'` | `none`, `node`, `encoding` | Prune method for paths that are subsequences of other paths |
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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/bag-of-paths-encoder/LICENSE) - Copyright &copy; Jan Müller
