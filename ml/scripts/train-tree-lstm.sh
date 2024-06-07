rm -f tree-lstm/.cache/tree_train.json.dataset
rm -f tree-lstm/.cache/tree_validation.json.dataset
rm -f tree-lstm/.cache/tree_test.json.dataset

source scripts/conda-activate.sh

python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json
