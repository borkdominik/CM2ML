rm -f gnn/.cache/graph_train.json.dataset
rm -f gnn/.cache/graph_validation.json.dataset
rm -f gnn/.cache/graph_test.json.dataset

source scripts/conda-activate.sh

python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json
