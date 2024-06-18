train_size=200
validation_size=30
test_size=30

train_start=1
validation_start=$(($train_size + $train_start))
test_start=$(($validation_start + $validation_size + 1))

input=../models/uml/dataset

parameters=("--strict" "--continue-on-error" "--relationships-as-edges" "--pretty" "--only-containment-associations" "--replace-node-ids" "--raw-strings" "--only-encoded-features")
feature_overrides=()

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$train_start" --limit "$train_size" --out .input/tree_train.json "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$validation_start" --limit "$validation_size" --out .input/tree_validation.json "${parameters[@]}" "--node-features" ".input/tree_train.json" "--edge-features" ".input/tree_train.json" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$test_start" --limit "$test_size" --out .input/tree_test.json "${parameters[@]}" "--node-features" ".input/tree_validation.json" "--edge-features" ".input/tree_validation.json"
