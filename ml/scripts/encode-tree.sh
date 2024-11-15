train_size=600
validation_size=200
test_size=200

train_start=1
validation_start=$(($train_size + $train_start))
test_start=$(($validation_start + $validation_size + 1))

input=../models/uml/dataset

parameters=(
  "--strict" "--deduplicate" "--continue-on-error" "--pretty"
  "--unify-types"
  "--format" "local"
  "--relationships-as-edges" "true"
  "--verbose-feature-values" "true"
  "--replace-node-ids"
  "--raw-strings" "--only-encoded-features"
  "--only-containment-associations" "true"
  # "--node-whitelist" "Property"
  # "--node-whitelist" "Class"
  # "--node-whitelist" "PrimitiveType"
  # "--node-whitelist" "Operation"
  # "--node-whitelist" "ControlFlow"
  # "--node-whitelist" "OpaqueBehavior"
  # "--node-whitelist" "Model"
  # "--node-whitelist" "LiteralInteger"
  # "--node-whitelist" "Package"
  # "--node-whitelist" "Profile"
)

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$train_start" --limit "$train_size" --out .input/tree_train.json "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$validation_start" --limit "$validation_size" --out .input/tree_validation.json "${parameters[@]}" --node-features ".input/tree_train.json" --edge-features ".input/tree_train.json" --deduplication-data ".input/tree_train.json" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$test_start" --limit "$test_size" --out .input/tree_test.json "${parameters[@]}" --node-features ".input/tree_validation.json" --edge-features ".input/tree_validation.json" --deduplication-data ".input/tree_train.json" --deduplication-data ".input/tree_validation.json"
