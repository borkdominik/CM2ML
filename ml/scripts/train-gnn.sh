rm -f gnn/.cache/graph_train.json.dataset
rm -f gnn/.cache/graph_validation.json.dataset
rm -f gnn/.cache/graph_test.json.dataset

rm -rf .output/gnn

source scripts/conda-activate.sh

python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 42
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 43
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 44
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 45
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 46
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 47
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 48
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 49
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 50
python gnn/src/gnn.py graph_train.json graph_validation.json graph_test.json 51

python gnn/src/calculate_metrics.py
