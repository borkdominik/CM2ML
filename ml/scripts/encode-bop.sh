time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .output/bag-of-paths.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 4 \
  --min-path-length 0 --max-path-length 1 \
  --step-weight edge-count --path-weight step-sum \
  --max-paths 0 \
  --node-templates '@path.length=0 -> {{attr.qualifiedName}}' \
  --node-templates '@type=Model -> <model={{name}}>' \
  --node-templates '{{path.step}}[[attr.name.exists->.{{name}}]].{{type}}'
