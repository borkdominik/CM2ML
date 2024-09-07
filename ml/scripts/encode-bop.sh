time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .output/bag-of-paths.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 100 \
  --min-path-length 1 --max-path-length 2 \
  --step-weight edge-count --path-weight step-sum \
  --max-paths 20 \
  --node-templates '@type=Model -> <model={{name}}>' --node-templates '{{name}}.{{type}}'
