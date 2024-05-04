# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project

rm -f ml/gnn/__pycache__/integration_train.json.dataset
rm -f ml/gnn/__pycache__/integration_validation.json.dataset
rm -f ml/gnn/__pycache__/integration_test.json.dataset

source ml/activate-environment.sh

time python ml/gnn/main.py integration_train.json integration_validation.json integration_test.json
