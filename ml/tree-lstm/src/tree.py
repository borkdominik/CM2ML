import json
import os
import random
import sys
import torch

from paper.mdeoperation import run
from tree_dataset import TreeDataset
from utils import script_dir

seed = sys.argv[4]

if seed is None:
    exit("Please provide the random seed as an argument")

torch.manual_seed(seed)
random.seed(seed)

train_dataset_file = sys.argv[1]
validation_dataset_file = sys.argv[2]
test_dataset_file = sys.argv[3]

if (
    train_dataset_file is None
    or validation_dataset_file is None
    or test_dataset_file is None
):
    exit(
        "Please provide the train, validation, and test dataset file paths as arguments"
    )

train_dataset = TreeDataset("train", train_dataset_file)
validation_dataset = TreeDataset("validation", validation_dataset_file)
test_dataset = TreeDataset("test", test_dataset_file)

print(
    f"Train dataset size: {len(train_dataset)} ({train_dataset.omitted_trees} trees omitted)"
)
print(
    f"Validation dataset size: {len(validation_dataset)} ({validation_dataset.omitted_trees} trees omitted)"
)
print(
    f"Test dataset size: {len(test_dataset)} ({test_dataset.omitted_trees} trees omitted)"
)

report = run(train_dataset, validation_dataset, test_dataset)

output_dir = f"{script_dir}/../../.output/tree-lstm/{seed}"
report_dir = f"{output_dir}/"
os.makedirs(report_dir, exist_ok=True)
for name, value in report.items():
    serialized = json.dumps(value, indent=4)
    with open(f"{report_dir}/{name}.json", "w") as file:
        file.write(serialized)
