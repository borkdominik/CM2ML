# @cm2ml/tf-encoder

## CLI Example

```bash
# Single model
cm2ml <language>-term-frequency <inputFile> \
  --out <outputFile> \
  --tf-idf \
  --include-types \
  --pretty

# Batch
cm2ml batch-<language>-term-frequency <inputDir> \
  --out <outputFile> \
  --bigram-enabled \
  --bigram-first-term name \
  --bigram-second-term type \
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
| `stopWords` | `list<string>` | default stop-word list | - | List of stop words to remove from the term list |
| `tokenize` | `boolean` | `true` | - | Split and clean terms into separate tokens |
| `termDelimiters` | `list<string>` | `[' ', '-', '_']` | - | Delimiters used to split tokens |
| `lowercase` | `boolean` | `true` | - | Convert terms to lowercase |
| `stem` | `boolean` | `false` | - | Apply stemming to terms |
| `normalizeTf` | `boolean` | `false` | - | Normalize term frequency by total number of terms in the document |
| `tfIdf` | `boolean` | `false` | - | Compute Term Frequency-Inverse Document Frequency (TF-IDF) scores for terms |
| `frequencyCutoff` | `number` | `0` | - | Minimum frequency for a term to be included in the matrix |
| `bigramEnabled` | `boolean` | `false` | - | Enable bi-gram extraction |
| `bigramSeparator` | `string` | `'.'` | - | Separator for bi-gram terms |
| `bigramFirstTerm` | `string` | `'name'` | `name`, `type`, `attribute` | First term of the bi-gram |
| `bigramFirstTermAttribute` | `string` | `''` | - | Attribute name for the first term (if `attribute` is selected) |
| `bigramSecondTerm` | `string` | `'type'` | `name`, `type`, `attribute` | Second term of the bi-gram |
| `bigramSecondTermAttribute` | `string` | `''` | - | Attribute name for the second term (if `attribute` is selected) |
| `nGramEnabled` | `boolean` | `false` | - | Enable N-gram extraction |
| `nGramLength` | `number` | `1` | - | Length of N-gram Paths |
| `keepLowerLengthPaths` | `boolean` | `false` | - | Keep lower length paths in N-gram extraction |
| `undirected` | `boolean` | `false` | - | Consider the graph as undirected when extracting N-gram paths |
| `includeNodeIds` | `boolean` | `true` | - | Include node IDs in output terms |
| `separateViews` | `boolean` | `false` | - | Handle each view separately |

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

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/encoders/tf-encoder/LICENSE) - Copyright &copy; Jan Müller
