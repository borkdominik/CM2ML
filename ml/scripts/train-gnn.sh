# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project

rm -f gnn/.cache/graph_train.json.dataset
rm -f gnn/.cache/graph_validation.json.dataset
rm -f gnn/.cache/graph_test.json.dataset

source scripts/conda-activate.sh

python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json
