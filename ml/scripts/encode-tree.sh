train_size=600
validation_size=200
test_size=200

train_start=1
validation_start=$(($train_size + $train_start))
test_start=$(($validation_start + $validation_size + 1))

input=../models/uml/dataset

parameters=("--strict" "--deduplicate" "--format" "local" "--continue-on-error" "--relationships-as-edges" "true" "--pretty" "--only-containment-associations" "true" "--replace-node-ids" "--raw-strings" "--only-encoded-features")

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$train_start" --limit "$train_size" --out .input/tree_train.json "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$validation_start" --limit "$validation_size" --out .input/tree_validation.json "${parameters[@]}" --node-features ".input/tree_train.json" --edge-features ".input/tree_train.json" --deduplication-data ".input/tree_train.json" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$test_start" --limit "$test_size" --out .input/tree_test.json "${parameters[@]}" --node-features ".input/tree_validation.json" --edge-features ".input/tree_validation.json" --deduplication-data ".input/tree_train.json" --deduplication-data ".input/tree_validation.json"
