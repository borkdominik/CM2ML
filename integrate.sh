# To use this script, first create the cm2ml conda environment from the environment.yml file in ml/gnn
# Next run `source integrate.sh` in the root directory of the project
conda activate cm2ml
rm -f ml/gnn/dataset/integration.json
time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-raw-graph ./models/uml/dataset --start 1 --limit 20000 --strict --merge --out ml/gnn/dataset/integration.json --continue-on-error --relationships-as-edges --include-equal-paths
cd ml/gnn
time python main.py integration.json
cd ../..
