time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-bag-of-paths ../models/uml/dataset \
  --out .output/patterns.json \
  --strict --pretty \
  --continue-on-error --start 1 --limit 200 \
  --only-containment-associations --relationships-as-edges \
  --max-partitioning-iterations 9999 --max-partition-size 4 \
  --mask-node-types \
  --min-pattern-length 3 --max-pattern-length 1000 \
  --max-patterns-per-partition 10 \
  --min-model-frequency 3 --min-absolute-frequency 5 \
  --max-patterns 10 --pattern-order absolute-frequency

