# ML

> Tip: Use the `ml` script of the root package for cleaner terminal output.
> E.g., `pnpm run ml train:gnn`.

## Conda Setup

> All `.sh` scripts must be run from this directory.

### Creating the Conda environment

`pnpm run conda:load`

### Activating the Conda environment

> Note: It is not possible to activate a Conda environment via a `package.json`-script.
> Instead, use the following command to activate the environment.
> It is not necessary to run this command if you are using the `turbo` commands.

`source scripts/conda-activate.sh`

### Updating the Conda environment

> Note: Make sure that the `cm2ml` environment is activated.

`pnpm run conda:save`

## Encoding & Training

Use the `encode:*` and `train:*` `turbo`-tasks to encode and train the model.

## Development

### Adding new encodings

1. Create a script for the encoding in the `scripts` directory, e.g., `encode-{ENCODING}.sh`. For reduced execution time, consider using [Bun](https://bun.sh).

Example for encoding UML raw graphs:

```bash
bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph ../models/uml/dataset
```

2. Create the [`package.json`](./package.json) script.

```json
{
  "scripts": {
    "encode:{ENCODING}": "source scripts/encode-{ENCODING}.sh"
  }
}
```

3. Create the Turbo task in [`turbo.json`](./turbo.json). It must depend on `^build` to ensure that it's using the latest version of the framework. Also, it must use the corresponding script as input and the generated dataset files as output.

```json
{
  "pipeline": {
    "encode:{ENCODING}": {
      "inputs": ["scripts/encode-{ENCODING}.sh"],
      "outputs": ["dataset/{ENCODING}_train.json", "dataset/{ENCODING}_validation.json", "dataset/{ENCODING}_test.json"],
      "dependsOn": ["^build"]
    }
  }
}
```

### Adding new evaluations

1. Implement your evaluation in `./{EVALUATION}/src/{EVALUATION}.py`.

2. Create a script for the evaluation in the `scripts` directory, e.g., `train-{EVALUATION}.sh`. For reduced execution time, consider using [Bun](https://bun.sh).

Example:

```bash
source scripts/conda-activate.sh

python {EVALUATION}/src/{EVALUATION}.py {ENCODING}_train.json {ENCODING}_validation.json {ENCODING}_test.json
```

3. Create the [`package.json`](./package.json) script.

```json
{
  "scripts": {
    "train:{EVALUATION}": "source scripts/train-{EVALUATION}.sh"
  }
}
```

4. Create the Turbo task in [`turbo.json`](./turbo.json). It must depend on the task of the dataset it uses and use the corresponding script, as well as the output of the encoding task and the Python source as inputs.

```json
{
  "pipeline": {
    "train:{EVALUATION}": {
      "inputs": ["scripts/train-{EVALUATION}.sh", "dataset/{ENCODING}_train.json", "dataset/{ENCODING}_validation.json", "dataset/{ENCODING}_test.json", "{EVALUATION}/src/**"],
      "dependsOn": ["encode:{ENCODING}"]
    }
  }
}
```
