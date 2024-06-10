import sys
from paper.mdeoperation import run
from tree_dataset import TreeDataset
from utils import merge_vocabularies

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

total_vocabulary = merge_vocabularies(
    [train_dataset.vocabulary, validation_dataset.vocabulary, test_dataset.vocabulary]
)
print(f"Total vocabulary size: {len(total_vocabulary)}")

run(train_dataset, validation_dataset, test_dataset, total_vocabulary)