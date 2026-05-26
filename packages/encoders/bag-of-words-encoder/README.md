# @cm2ml/bag-of-words-encoder

## CLI Example

```bash
# Single model
cm2ml <language>-bag-of-words <inputFile> \
  --out <outputFile> \
  --include-types \
  --remove-duplicates \
  --pretty

# Batch
cm2ml batch-<language>-bag-of-words <inputDir> \
  --out <outputFile> \
  --include-types \
  --term-delimiters " " "-" "_" \
  --pretty
```

## Available Parameters

| Parameter | Type | Default | Allowed Values | Description |
| --- | --- | --- | --- | --- |
| `includeNames` | `boolean` | `true` | - | Encode names as terms |
| `includeTypes` | `boolean` | `false` | - | Encode types as terms |
| `includedAttributes` | `list<string>` | `[]` | - | Additional attributes to encode as terms |
| `minTermLength` | `number` | `1` | - | Minimum term length |
| `maxTermLength` | `number` | `100` | - | Maximum length of terms |
| `removeDuplicates` | `boolean` | `false` | - | Remove duplicate terms so that each term appears only once per model |
| `stopWords` | `list<string>` | `[]` | - | List of stop words to exclude |
| `tokenize` | `boolean` | `true` | - | Split and clean terms into separate tokens (controlled by term delimiters) |
| `termDelimiters` | `list<string>` | `[' ', '-', '_']` | - | Delimiters used to split tokens |
| `lowercase` | `boolean` | `true` | - | Convert terms to lowercase |
| `stem` | `boolean` | `false` | - | Apply stemming to terms |
| `includeNodeIds` | `boolean` | `true` | - | Include node IDs in output terms |
| `separateViews` | `boolean` | `false` | - | Separate Views |
| `encodeAsSentence` | `boolean` | `false` | - | Encode nodes as sentences |
| `encodeRelationships` | `boolean` | `false` | - | Include relationships in sentences |

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/bag-of-words-encoder/LICENSE) - Copyright &copy; Jan Müller
