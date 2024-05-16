train_size=2000
validation_size=500
test_size=500

train_start=1
validation_start=$(($train_size + $train_start))
test_start=$(($validation_start + $validation_size + 1))

input=../models/uml/dataset

parameters=("--strict" "--merge" "--continue-on-error" "--relationships-as-edges" "--include-equal-paths" "--raw-strings" "--only-encoded-features")
feature_overrides=("--node-features" "dataset/graph_train.json" "--edge-features" "dataset/graph_train.json")

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$input" --start "$train_start" --limit "$train_size" --out dataset/graph_train.json "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$input" --start "$validation_start" --limit "$validation_size" --out dataset/graph_validation.json  "${feature_overrides[@]}" "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph "$input" --start "$test_start" --limit "$test_size" --out dataset/graph_test.json "${feature_overrides[@]}" "${parameters[@]}"
