# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project
pnpm run build --filter=cli...

train_size=2000
validation_size=1000
test_size=1000

validation_start=$(($train_size + 1))
test_start=$(($validation_start + $validation_size + 1))

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph models/uml/dataset --start 1 --limit "$train_size" --strict --merge --out ml/gnn/dataset/integration_train.json --continue-on-error --relationships-as-edges --include-equal-paths
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph models/uml/dataset --start "$validation_start" --limit "$validation_size" --strict --merge --out ml/gnn/dataset/integration_validation.json --continue-on-error --relationships-as-edges --include-equal-paths --node-features ml/gnn/dataset/integration_train.json --edge-features ml/gnn/dataset/integration_train.json
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph models/uml/dataset --start "$test_start" --limit "$test_size" --strict --merge --out ml/gnn/dataset/integration_test.json --continue-on-error --relationships-as-edges --include-equal-paths --node-features ml/gnn/dataset/integration_train.json --edge-features ml/gnn/dataset/integration_train.json

rm -f ml/gnn/__pycache__/integration_train.json.dataset
rm -f ml/gnn/__pycache__/integration_validation.json.dataset
rm -f ml/gnn/__pycache__/integration_test.json.dataset

conda activate cm2ml
time python ml/gnn/main.py integration_train.json integration_validation.json integration_test.json
