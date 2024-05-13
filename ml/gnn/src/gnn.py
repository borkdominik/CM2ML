import sys
import time
import torch

from dataset import CM2MLDataset
from model.gat import GATModel
from model.gcn import GCNModel
from utils import pretty_duration

torch.manual_seed(42)

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

num_epochs = 2000
start_epoch = 0
patience = 5

print("======================")
print("Train dataset file:", train_dataset_file)
dataset_load_start_time = time.perf_counter()
train_dataset = CM2MLDataset("train", train_dataset_file)
dataset_load_end_time = time.perf_counter()
print(
    f"Train dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
)
print(f"Number of graphs: {len(train_dataset)}")
print(f"Number of node features: {train_dataset.num_features}")
print(f"Number of edge features: {train_dataset.num_edge_features}")
print(f"Number of classes: {train_dataset.num_classes}")

print("======================")

print("Validation dataset file:", validation_dataset_file)
dataset_load_start_time = time.perf_counter()
validation_dataset = CM2MLDataset("validation", validation_dataset_file)
dataset_load_end_time = time.perf_counter()
print(
    f"Validation dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
)
print(f"Number of graphs: {len(validation_dataset)}")
print(f"Number of node features: {validation_dataset.num_features}")
print(f"Number of edge features: {validation_dataset.num_edge_features}")
print(f"Number of classes: {validation_dataset.num_classes}")

print("======================")

print("Test dataset file:", test_dataset_file)
dataset_load_start_time = time.perf_counter()
test_dataset = CM2MLDataset("test", test_dataset_file)
dataset_load_end_time = time.perf_counter()
print(
    f"Test dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
)
print(f"Number of graphs: {len(test_dataset)}")
print(f"Number of node features: {test_dataset.num_features}")
print(f"Number of edge features: {test_dataset.num_edge_features}")
print(f"Number of classes: {test_dataset.num_classes}")
print("======================")

max_num_classes = max(
    train_dataset.num_classes,
    validation_dataset.num_classes,
    test_dataset.num_classes,
)

num_uml_types = 193
num_node_features = train_dataset.num_features
num_edge_features = train_dataset.num_edge_features
hidden_channels = max_num_classes * 2
out_channels = max_num_classes

if (
    train_dataset.num_features != validation_dataset.num_features
    or train_dataset.num_features != test_dataset.num_features
):
    exit("Train, validation, or test dataset node features do not match")
if (
    train_dataset.num_edge_features != validation_dataset.num_edge_features
    or train_dataset.num_edge_features != test_dataset.num_edge_features
):
    exit("Train, validation or test dataset edge features do not match")

GATModel(
    num_node_features=num_node_features,
    num_edge_features=num_edge_features,
    hidden_channels=hidden_channels,
    out_channels=out_channels,
).evaluate(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    test_dataset=test_dataset,
).fit(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    num_epochs=num_epochs,
    start_epoch=start_epoch,
    patience=patience,
).evaluate(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    test_dataset=test_dataset,
)
print("======================")

GCNModel(
    num_node_features=num_node_features,
    hidden_channels=hidden_channels,
    out_channels=out_channels,
).evaluate(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    test_dataset=test_dataset,
).fit(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    num_epochs=num_epochs,
    start_epoch=start_epoch,
    patience=patience,
).evaluate(
    train_dataset=train_dataset,
    validation_dataset=validation_dataset,
    test_dataset=test_dataset,
)
print("======================")
