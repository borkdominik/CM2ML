train_size=8
validation_size=4
test_size=2

train_start=1
validation_start=$(($train_size + $train_start))
test_start=$(($validation_start + $validation_size + 1))

input=../models/uml/dataset

parameters=("--strict" "--merge" "--continue-on-error" "--relationships-as-edges")

time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$train_start" --limit "$train_size" --out .input/tree_train.json "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$validation_start" --limit "$validation_size" --out .input/tree_validation.json  "${parameters[@]}" && \
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-tree "$input" --start "$test_start" --limit "$test_size" --out .input/tree_test.json "${parameters[@]}"
