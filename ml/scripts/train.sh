# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project

rm -f gnn/cache/integration_train.json.dataset
rm -f gnn/cache/integration_validation.json.dataset
rm -f gnn/cache/integration_test.json.dataset

source scripts/conda-activate.sh

time python gnn/src/main.py integration_train.json integration_validation.json integration_test.json
