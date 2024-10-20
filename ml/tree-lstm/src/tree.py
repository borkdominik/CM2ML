import datetime
import json
import os
import random
import sys
import torch

import paper.data_utils as data_utils
from paper.mdeoperation import run
from tree_dataset import TreeDataset
from utils import script_dir


def set_seed(seed):
    torch.manual_seed(seed)
    random.seed(seed)


set_seed(7)

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

print("-" * 80)
train_dataset = TreeDataset("train", train_dataset_file)
print("-" * 80)
validation_dataset = TreeDataset("validation", validation_dataset_file)
print("-" * 80)
test_dataset = TreeDataset("test", test_dataset_file)
print("-" * 80)

vocab_start = datetime.datetime.now()
source_vocab, target_vocab = data_utils.build_vocab(
    [train_dataset, validation_dataset, test_dataset]
)
print(f"Source vocabulary size: {len(source_vocab)}")
print(f"Target vocabulary size: {len(target_vocab)}")
print(f"Vocabulary built in {datetime.datetime.now() - vocab_start}")

tokenization_start = datetime.datetime.now()
tokenized_training_dataset = data_utils.prepare_data(
    train_dataset, source_vocab, target_vocab
)
tokenized_validation_dataset = data_utils.prepare_data(
    validation_dataset, source_vocab, target_vocab
)
tokenized_test_dataset = data_utils.prepare_data(
    test_dataset, source_vocab, target_vocab
)
print(f"Data tokenized in {datetime.datetime.now() - tokenization_start}")
print("-" * 80)

for offset in range(0, 3):
    seed = 42 + offset
    set_seed(42 + seed)
    print(f"Running with seed {seed}")
    print("-" * 80)
    report = run(
        tokenized_training_dataset,
        tokenized_validation_dataset,
        tokenized_test_dataset,
        source_vocab,
        target_vocab,
        seed,
    )

    output_dir = f"{script_dir}/../../.output/tree-lstm/{seed}"
    os.makedirs(output_dir, exist_ok=True)
    for name, value in report.items():
        serialized = json.dumps(value, indent=4)
        with open(f"{output_dir}/{name}.json", "w") as file:
            file.write(serialized)

    print("-" * 80)
