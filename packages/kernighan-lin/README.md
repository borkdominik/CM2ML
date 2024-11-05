# kernighan-lin

> Dependency-free implementation of the Kernighan-Lin algorithm for graph partitioning.

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

## Usage

```ts
import { type Options, kernighanLin, recursiveKernighanLin } from 'kernighan-lin'

// Bring-your-own-model, as long as vertices are unique to support Set<Vertex> and Map<Vertex, ...>.
type Vertex = string

const vertices: Set<Vertex> = new Set(['a', 'b', 'c', 'd', 'e', 'f'])
const edges: [Vertex, Vertex][] = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'd'],
  ['d', 'a'],
  ['e', 'f'],
  ['f', 'a'],
]

// Define how to get connected vertices for your model.
// This example uses undirected edges, but directed edges are also supported by including them here.
const getConnections = (vertex: string): Set<string> => new Set(edges.filter(([a, _b]) => a === vertex).map(([_a, b]) => b))

const options: Options<Vertex> = {
  // Negative values remove the limit. The default is 10.
  maxIterations: 10,
  // While the default is 1, you can define custom costs, i.e., connection strengths, here.
  // For example, if a graph allows multiple edges between vertices, you can count them here.
  // Note that the result of this function is cached for performance reasons.
  // Most importantly, the function must be symmetric, i.e., cost(a, b) === cost(b, a).
  cost: (_a: Vertex, _b: Vertex) => 1,
}

const _twoPartitions = kernighanLin(vertices, getConnections, options)
// OR
const _manyPartitions = recursiveKernighanLin(vertices, getConnections, { ...options, maxPartitionSize: 2 })
```

## License

[MIT](https://github.com/borkdominik/CM2ML/blob/main/packages/kernighan-lin/LICENSE) - Copyright &copy; Jan Müller
