time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .output/bag-of-paths.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 100 \
  --only-containment-associations --relationships-as-edges \
  --min-path-length 2 --max-path-length 4 \
  --step-weight edge-count --path-weight step-product \
  --max-paths 4

