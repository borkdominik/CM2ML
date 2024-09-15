time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .input/bag-of-paths.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 10000 \
  --relationships-as-edges --only-containment-associations \
  --edge-blacklist 'owner' --edge-blacklist 'ownedElement' --edge-blacklist 'association' --edge-blacklist 'associationClass' \
  --min-path-length 1 --max-path-length 2 \
  --step-weighting '@type.exists >>> 2000' \
  --step-weighting '@type.not.exists >>> 0' \
  --path-weight step-sum \
  --max-paths 0 \
  --prune-method 'encoding' \
  --node-templates '@name.exists >>> {{name}} {{type}}' \
  --node-templates 'unnamed {{type}}' \
  --edge-templates '@tag = abstraction >>> abstracts' \
  --edge-templates '@tag = communicationPath >>> communicates with' \
  --edge-templates '@tag = componentRealization >>> realizes' \
  --edge-templates '@tag = dependency >>> depends on' \
  --edge-templates '@tag = deployment >>> deploys' \
  --edge-templates '@tag = elementImport >>> imports' \
  --edge-templates '@tag = extend >>> extends' \
  --edge-templates '@tag = extension >>> extends' \
  --edge-templates '@tag = generalization >>> generalizes' \
  --edge-templates '@tag = include >>> includes' \
  --edge-templates '@tag = informationFlow >>> informs' \
  --edge-templates '@tag = interfaceRealization >>> realizes' \
  --edge-templates '@tag = manifestation >>> manifests' \
  --edge-templates '@tag = packageImport >>> imports' \
  --edge-templates '@tag = packageMerge >>> merges' \
  --edge-templates '@tag = profileApplication >>> applies' \
  --edge-templates '@tag = protocolConformance >>> conforms to' \
  --edge-templates '@tag = protocolTransition >>> transitions to' \
  --edge-templates '@tag = realization >>> realizes' \
  --edge-templates '@tag = substitution >>> substitutes' \
  --edge-templates '@tag = templateBinding >>> binds' \
  --edge-templates '@tag = transition >>> transitions to' \
  --edge-templates '@tag = usage >>> uses' \
  --edge-templates '{{tag}}' \

source scripts/conda-activate.sh

python bop/src/join-segments.py
