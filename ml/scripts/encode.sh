train_size=10
validation_size=10
test_size=10

validation_start=$(($train_size + 1))
test_start=$(($validation_start + $validation_size + 1))

dataset=../models/uml/dataset

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$dataset" --start 1 --limit "$train_size" --strict --merge --out gnn/dataset/integration_train.json --continue-on-error --relationships-as-edges --include-equal-paths && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$dataset" --start "$validation_start" --limit "$validation_size" --strict --merge --out gnn/dataset/integration_validation.json --continue-on-error --relationships-as-edges --include-equal-paths --node-features gnn/dataset/integration_train.json --edge-features gnn/dataset/integration_train.json && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$dataset" --start "$test_start" --limit "$test_size" --strict --merge --out gnn/dataset/integration_test.json --continue-on-error --relationships-as-edges --include-equal-paths --node-features gnn/dataset/integration_train.json --edge-features gnn/dataset/integration_train.json
