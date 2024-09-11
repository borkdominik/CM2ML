time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .input/bag-of-paths.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 1000 \
  --relationships-as-edges --only-containment-associations \
  --edge-blacklist 'owner' --edge-blacklist 'ownedElement' --edge-blacklist 'association' \
  --min-path-length 1 --max-path-length 2 \
  --step-weighting '@type.exists >>> 2000' \
  --step-weighting '@type.not.exists >>> 0' \
  --path-weight step-sum \
  --max-paths 0 \
  --node-templates '@name.exists >>> {{name}} {{type}}' \
  --node-templates 'unnamed {{type}}' \
  --edge-templates '@tag = dependency >>> depends on' \
  --edge-templates '@tag = elementImport >>> imports' \
  --edge-templates '@tag = generalization >>> generalizes' \
  --edge-templates '@tag = packageImport >>> imports' \
  --edge-templates '@tag = transition >>> transitions to' \
  --edge-templates '{{tag}}' \

source scripts/conda-activate.sh

python bop/src/join-segments.py
