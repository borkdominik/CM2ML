rm -f tree-lstm/.cache/tree_train.json.dataset
rm -f tree-lstm/.cache/tree_validation.json.dataset
rm -f tree-lstm/.cache/tree_test.json.dataset

rm -rf .output/tree-lstm

source scripts/conda-activate.sh

mkdir -p .output/tree-lstm/42
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 42 | tee .output/tree-lstm/42/log.txt
mkdir -p .output/tree-lstm/43
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 43 | tee .output/tree-lstm/43/log.txt
mkdir -p .output/tree-lstm/44
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 44 | tee .output/tree-lstm/44/log.txt
mkdir -p .output/tree-lstm/45
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 45 | tee .output/tree-lstm/45/log.txt
mkdir -p .output/tree-lstm/46
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 46 | tee .output/tree-lstm/46/log.txt
mkdir -p .output/tree-lstm/47
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 47 | tee .output/tree-lstm/47/log.txt
mkdir -p .output/tree-lstm/48
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 48 | tee .output/tree-lstm/48/log.txt
mkdir -p .output/tree-lstm/49
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 49 | tee .output/tree-lstm/49/log.txt
mkdir -p .output/tree-lstm/50
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 50 | tee .output/tree-lstm/50/log.txt
mkdir -p .output/tree-lstm/51
python tree-lstm/src/tree.py tree_train.json tree_validation.json tree_test.json 51 | tee .output/tree-lstm/51/log.txt

python tree-lstm/src/calculate_metrics.py
