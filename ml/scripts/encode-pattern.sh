time bun node_modules/@cm2ml/cli/bin/cm2ml.mjs batch-uml-pattern-miner ../models/uml/dataset \
  --out .output/patterns.json \
  --strict --pretty \
  --remove-duplicates \
  --continue-on-error --start 1 --limit 10000 \
  --only-containment-associations --relationships-as-edges \
  --edge-blacklist "association" --edge-blacklist "owner" --edge-blacklist "ownedElement" --edge-blacklist "usage" \
  --max-partitioning-iterations 9999 --max-partition-size 8 \
  --mask-node-types false \
  --min-pattern-length 3 --max-pattern-length 1000 \
  --max-patterns-per-partition 50 \
  --min-model-frequency 3 --min-absolute-frequency 5 \
  --max-patterns 20 --pattern-order model-frequency

