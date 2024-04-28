import time
import torch

from dataset import CM2MLDataset
from model.gat import GATModel
from model.gcn import GCNModel
from utils import pretty_duration

torch.manual_seed(42)

dataset_file = "equal-paths.json"
num_epochs = 2000
start_epoch = 0
hidden_channels = 128
patience = 10

dataset_load_start_time = time.perf_counter()
dataset = CM2MLDataset(dataset_file)
dataset_load_end_time = time.perf_counter()
print("======================")
print(
    f"Dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
)
print(f"Number of graphs: {len(dataset)}")
print(f"Number of node features: {dataset.num_features}")
print(f"Number of edge features: {dataset.num_edge_features}")
print(f"Number of classes: {dataset.num_classes}")
print("======================")
train_dataset = dataset[0:2]
test_dataset = dataset[2:]


GATModel(
    num_node_features=dataset.num_features,
    num_edge_features=dataset.num_edge_features,
    hidden_channels=hidden_channels,
    out_channels=dataset.num_classes,
).fit(
    train_dataset=train_dataset,
    test_dataset=test_dataset,
    num_epochs=num_epochs,
    start_epoch=start_epoch,
    patience=patience,
).evaluate(train_dataset, test_dataset)
print("======================")

GCNModel(
    num_node_features=dataset.num_features,
    hidden_channels=hidden_channels,
    out_channels=dataset.num_classes,
).fit(
    train_dataset=train_dataset,
    test_dataset=test_dataset,
    num_epochs=num_epochs,
    start_epoch=start_epoch,
    patience=patience,
).evaluate(train_dataset, test_dataset)
print("======================")
