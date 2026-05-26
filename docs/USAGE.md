# Usage

CM2ML supports four usage modes:

1. CLI
2. REST API
3. Library (Node.js/TypeScript)
4. Visualization

For encoder-specific parameters and additional examples, see the encoder READMEs:

- [@cm2ml/bag-of-paths-encoder](../packages/encoders/bag-of-paths-encoder/README.md)
- [@cm2ml/bag-of-words-encoder](../packages/encoders/bag-of-words-encoder/README.md)
- [@cm2ml/embeddings-encoder](../packages/encoders/embeddings-encoder/README.md)
- [@cm2ml/feature-encoder](../packages/encoders/feature-encoder/README.md)
- [@cm2ml/graph-encoder](../packages/encoders/graph-encoder/README.md)
- [@cm2ml/tf-encoder](../packages/encoders/tf-encoder/README.md)
- [@cm2ml/tree-encoder](../packages/encoders/tree-encoder/README.md)
- [@cm2ml/triples-encoder](../packages/encoders/triples-encoder/README.md)

## CLI

Use the CLI for reproducible and scriptable processing.

```bash
# single model
cm2ml <language>-<encoding> <inputFile> [options]

# batch processing
cm2ml batch-<language>-<encoding> <inputDir> [options]
```

Typical values:

- `<language>`: `archimate`, `uml`, `ecore`
- `<encoding>`: `bag-of-paths`, `bag-of-words`, `embeddings`, `feature-encoder`, `raw-graph`, `term-frequency`, `tree`, `triples`

Example:

```bash
cm2ml batch-archimate-bag-of-words ./models \
  --out ./output/encoding.json \
  --pretty \
  --strict \
  --relationships-as-nodes \
  --include-types
```

Common CLI options:

- `--out <file>`: write JSON output to file (default: stdout)
- `--pretty`: pretty-print JSON output
- `--strict`: fail on unknown or invalid input
- `--debug`: log debug information

Batch-only options:

- `--start <n>`: index of first model to process
- `--limit <n>`: maximum number of models to process
- `--continue-on-error`: continue batch processing after failures

Get available commands:

```bash
cm2ml --help
cm2ml <language>-<encoding> --help
cm2ml batch-<language>-<encoding> --help
```

## REST API

Start the server:

```bash
cm2ml-server
```

Main endpoints:

- `GET /health`: health check
- `GET /plugins`: list all available parser-encoder plugins and their parameters
- `POST /plugins/{name}`: execute a plugin, e.g. `archimate-term-frequency`

Example request:

```bash
curl http://localhost:8080/plugins/archimate-term-frequency \
  --header "Content-Type: application/json" \
  --request POST \
  --data '{
    "input": ["<model-xml-1>", "<model-xml-2>"],
    "includeTypes": true,
    "tfIdf": true
  }'
```

Embeddings utility endpoints:

- `GET /embedding/{model}/{term}`: Returns the embedding vector for `term` in the selected embedding `model`.
- `GET /embedding/{model}/{term}/similar`: Returns the most similar known word to `term` (for the selected model) together with its embedding vector.
- `POST /pooled`: Pools multiple embedding vectors into one vector using `poolingType` (`mean` or `max`).

## Library

Use `@cm2ml/builtin` for direct parser and encoder access:

```ts
import fs from 'node:fs'
import { ArchimateParser, TermFrequencyEncoder } from '@cm2ml/builtin'

// Read Model
const serializedModel = fs.readFileSync('example.archimate', 'utf8')

// Parse Model to IR
const graphModel = ArchimateParser.invoke(serializedModel, { debug: true, strict: true })

// Run Encoder
const output = TermFrequencyEncoder.invoke([graphModel], { tfIdf: true })
```

## Visualization

The visualizer allows exploring the encoding for single-model, including:

- parser behavior and parser parameters
- IR graph/tree structure
- encoder parameters and outputs

The hosted visualizer is available at [https://cm2ml.vercel.app](https://cm2ml.vercel.app).

You can also run the visualizer locally from `[packages/visualizer](../packages/visualizer)`:

```bash
# from repository root
pnpm --filter @cm2ml/visualizer dev
```

or

```bash
# from packages/visualizer
pnpm dev
```

## Parser Parameters

Parser parameters are part of each `<language>-<encoding>` command.

### ArchiMate parser (`archimate-*`)


| Parameter              | CLI Option                 | Type           | Default | Description                                       |
| ---------------------- | -------------------------- | -------------- | ------- | ------------------------------------------------- |
| `debug`                | `--debug`                  | `boolean`      | `false` | Log debug information.                            |
| `strict`               | `--strict`                 | `boolean`      | `false` | Fail on unknown or invalid input.                 |
| `relationshipsAsNodes` | `--relationships-as-nodes` | `boolean`      | `false` | Treat relationships as nodes.                     |
| `viewsAsNodes`         | `--views-as-nodes`         | `boolean`      | `false` | Include views and link their respective elements. |
| `nodeWhitelist`        | `--node-whitelist <...>`   | `list<string>` | `[]`    | Whitelist of ArchiMate element types.             |
| `nodeBlacklist`        | `--node-blacklist <...>`   | `list<string>` | `[]`    | Blacklist of ArchiMate element types.             |
| `edgeWhitelist`        | `--edge-whitelist <...>`   | `list<string>` | `[]`    | Whitelist of edge types.                          |
| `edgeBlacklist`        | `--edge-blacklist <...>`   | `list<string>` | `[]`    | Blacklist of edge types.                          |


### UML parser (`uml-*`)


| Parameter                     | CLI Option                        | Type           | Default | Description                                             |
| ----------------------------- | --------------------------------- | -------------- | ------- | ------------------------------------------------------- |
| `debug`                       | `--debug`                         | `boolean`      | `false` | Log debug information.                                  |
| `strict`                      | `--strict`                        | `boolean`      | `false` | Fail on unknown or invalid input.                       |
| `onlyContainmentAssociations` | `--only-containment-associations` | `boolean`      | `false` | Keep only containment associations as edges.            |
| `relationshipsAsEdges`        | `--relationships-as-edges`        | `boolean`      | `false` | Treat relationships as edges.                           |
| `nodeWhitelist`               | `--node-whitelist <...>`          | `list<string>` | `[]`    | Whitelist of UML element types.                         |
| `nodeBlacklist`               | `--node-blacklist <...>`          | `list<string>` | `[]`    | Blacklist of UML element types.                         |
| `edgeWhitelist`               | `--edge-whitelist <...>`          | `list<string>` | `[]`    | Whitelist of association names.                         |
| `edgeBlacklist`               | `--edge-blacklist <...>`          | `list<string>` | `[]`    | Blacklist of association names.                         |
| `attributeWhitelist`          | `--attribute-whitelist <...>`     | `list<string>` | `[]`    | Whitelist of attribute names.                           |
| `attributeBlacklist`          | `--attribute-blacklist <...>`     | `list<string>` | `[]`    | Blacklist of attribute names.                           |
| `randomizedIdPrefix`          | `--randomized-id-prefix`          | `boolean`      | `false` | Use random prefix for generated IDs.                    |
| `nodeTagAsAttribute`          | `--node-tag-as-attribute`         | `boolean`      | `false` | Add node tags as attributes (IR post-processing).       |
| `edgeTagAsAttribute`          | `--edge-tag-as-attribute`         | `boolean`      | `false` | Add edge tags as attributes (IR post-processing).       |
| `unifyTypes`                  | `--unify-types`                   | `boolean`      | `false` | Normalize all type attributes into a single type field. |


### Ecore parser (`ecore-*`)

`@cm2ml/ecore` is currently a placeholder parser and not feature-complete yet.


| Parameter            | CLI Option                | Type      | Default | Description                                             |
| -------------------- | ------------------------- | --------- | ------- | ------------------------------------------------------- |
| `debug`              | `--debug`                 | `boolean` | `false` | Log debug information.                                  |
| `strict`             | `--strict`                | `boolean` | `false` | Fail on unknown or invalid input.                       |
| `nodeTagAsAttribute` | `--node-tag-as-attribute` | `boolean` | `false` | Add node tags as attributes (IR post-processing).       |
| `edgeTagAsAttribute` | `--edge-tag-as-attribute` | `boolean` | `false` | Add edge tags as attributes (IR post-processing).       |
| `unifyTypes`         | `--unify-types`           | `boolean` | `false` | Normalize all type attributes into a single type field. |


