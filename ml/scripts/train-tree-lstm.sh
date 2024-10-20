rm -f tree-lstm/.cache/tree_train.json.dataset
rm -f tree-lstm/.cache/tree_validation.json.dataset
rm -f tree-lstm/.cache/tree_test.json.dataset

rm -rf .output/tree-lstm
mkdir -p .output/tree-lstm

source scripts/conda-activate.sh

python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json | tee .output/tree-lstm/log.txt

python tree-lstm/src/calculate_metrics.py
