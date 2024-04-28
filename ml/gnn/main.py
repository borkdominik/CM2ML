import time
import torch

from dataset import CM2MLDataset
from evaluate import evaluate_model
from models import GATModel, GCNModel
from train import train_model
from utils import device, pretty_duration

# torch.manual_seed(140)

dataset_file = "test.json"
n_epochs = 2000
start_epoch = 0
hidden_channels = 128

dataset_load_start_time = time.perf_counter()
dataset = CM2MLDataset(dataset_file)
dataset_load_end_time = time.perf_counter()
dataset.to(device)
train_dataset = dataset[0:2]
test_dataset = dataset[2:]
print("======================")
print(
    f"Dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
)
print(f"Number of graphs: {len(dataset)}")
print(f"Number of node features: {dataset.num_features}")
print(f"Number of edge features: {dataset.num_edge_features}")
print(f"Number of classes: {dataset.num_classes}")

def accuracy(logits, labels):
    pred = torch.argmax(logits, dim=1)
    acc = torch.mean((pred == labels).float())
    return acc

print("======================")
gat_model = GATModel(
    dataset.num_features,
    dataset.num_edge_features,
    hidden_channels,
    dataset.num_classes,
).to(device)
train_model("GAT", gat_model, train_dataset, optimizer=torch.optim.Adam(gat_model.parameters(), lr=0.01), criterion=torch.nn.CrossEntropyLoss(), accuracy=accuracy, num_epochs=n_epochs, start_epoch=start_epoch)
evaluate_model("GAT", gat_model, train_dataset, test_dataset, accuracy)

print("======================")

gcn_model = GCNModel(dataset.num_features, hidden_channels, dataset.num_classes).to(
    device
)
train_model(
    "GCN",
    gcn_model,
    train_dataset,
    optimizer=torch.optim.Adam(gcn_model.parameters(), lr=0.01),
    criterion=torch.nn.CrossEntropyLoss(),
    accuracy=accuracy,
    num_epochs=n_epochs,
    start_epoch=start_epoch,
)
evaluate_model("GCN", gcn_model, train_dataset, test_dataset, accuracy)
print("======================")
