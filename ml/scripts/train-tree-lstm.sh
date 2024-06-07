# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project

rm -f gnn/.cache/tree_train.json.dataset
rm -f gnn/.cache/tree_validation.json.dataset
rm -f gnn/.cache/tree_test.json.dataset

source scripts/conda-activate.sh

python tree-lstm/src/tree-lstm.py tree_train.json tree_validation.json tree_test.json
