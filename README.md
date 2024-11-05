<!-- DO NOT EDIT THIS FILE MANUALLY. USE THE `generate-readme` SCRIPT AND SEE packages/scripts/src/generate-readme.ts. -->
# cm2ml

> Visualizer: <https://cm2ml.vercel.app>

> CM2ML is a framework for encoding the structure and semantics of conceptual models. It decouples concrete modeling languages from encoder implementations through an intermediate representation.

## Installation

### Library

The entire CM2ML framework is available via the `@cm2ml/cm2ml` package.
This includes all modules, as well as the CLI and REST adapters.

```bash
npm install @cm2ml/cm2ml
```

### Library (Browser)

The `@cm2ml/builtin` package may be used in the browser, as it does not include the CLI and REST server.
Parser and encoder authors may also install `@cm2ml/plugin`, `@cm2ml/ir`.
Authors of adapters may install `@cm2ml/plugin-adapter`.

```bash
npm install @cm2ml/builtin @cm2ml/plugin @cm2ml/plugin-adapter @cm2ml/ir
```

### CLI

```bash
npm install -g @cm2ml/cli

cm2ml -h
```

### REST Server

```bash
npm install -g @cm2ml/server

cm2ml-server
```

## Packages

### Encoders

- [@cm2ml/bag-of-paths-encoder](./packages/encoders/bag-of-paths-encoder)
- [@cm2ml/feature-encoder](./packages/encoders/feature-encoder)
- [@cm2ml/graph-encoder](./packages/encoders/graph-encoder)
- [@cm2ml/tf-encoder](./packages/encoders/tf-encoder)
- [@cm2ml/tree-encoder](./packages/encoders/tree-encoder)

### Framework

- [@cm2ml/builtin](./packages/framework/builtin)
- [@cm2ml/cli](./packages/framework/cli)
- [@cm2ml/cli-adapter](./packages/framework/cli-adapter)
- [@cm2ml/cm2ml](./packages/framework/cm2ml)
- [@cm2ml/deduplicate](./packages/framework/deduplicate)
- [@cm2ml/ir](./packages/framework/ir)
- [@cm2ml/ir-post-processor](./packages/framework/ir-post-processor)
- [@cm2ml/metamodel](./packages/framework/metamodel)
- [@cm2ml/metamodel-refiner](./packages/framework/metamodel-refiner)
- [@cm2ml/plugin](./packages/framework/plugin)
- [@cm2ml/plugin-adapter](./packages/framework/plugin-adapter)
- [@cm2ml/rest](./packages/framework/rest)
- [@cm2ml/rest-adapter](./packages/framework/rest-adapter)
- [@cm2ml/xml-parser](./packages/framework/xml-parser)

### Languages

- [@cm2ml/archimate](./packages/languages/archimate)
- [@cm2ml/ecore](./packages/languages/ecore)
- [@cm2ml/uml](./packages/languages/uml)

### Pattern Mining

- [@cm2ml/pattern-miner](./packages/pattern-mining/pattern-miner)
- [kernighan-lin](./packages/pattern-mining/kernighan-lin)
- [prefixspan](./packages/pattern-mining/prefixspan)

### Other

- [@cm2ml/ml](./ml)
- [@cm2ml/scripts](./packages/scripts)
- [@cm2ml/tsconfig](./packages/tsconfig)
- [@cm2ml/utils](./packages/utils)
- [@cm2ml/visualizer](./packages/visualizer)

## Development

Enable corepack with `corepack enable` to automate the installation and selection of the correct package manager.
Dependencies may be installed via `pnpm install`.
This monorepo uses Turborepo to orchestrate task execution.
The `build`, `test`, `lint`, and `typecheck` tasks are available in all packages.
The `turbo` package script may be used to execute tasks as required.

The `ci` and `ci:full` package scripts execute all tasks, with the latter including E2E tests.

### Testing

The locally built CLI and REST server may be started via the `cm2ml` and `server` package scripts.

### Releasing

To create a release, run the `changeset` package script.
This will guide you through the process of creating a changeset.
Next, commit the changeset and push to the main branch.
The CI will create a pull request for the release that must be merged to publish the packages.
