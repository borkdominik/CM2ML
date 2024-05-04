# ML

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

Use the `encode`, `train`, and `train:only` via `turbo` to encode and train the model.
