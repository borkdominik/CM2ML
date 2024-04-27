import os
import torch
from torch.nn import Dropout, ReLU
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

from dataset import CM2MLDataset

torch.manual_seed(140)

use_mps = False and torch.backends.mps.is_available() and torch.backends.mps.is_built()

device = torch.device("mps" if use_mps else "cpu")
print(f"Using device: {device}")

dataset = CM2MLDataset(
    f"{os.path.dirname(os.path.realpath(__file__))}/dataset/test.json"
)
dataset.to(device)
print(dataset[0])
print(f"Number of graphs: {len(dataset)}")
print(f"Number of features: {dataset.num_features}")
print(f"Number of classes: {dataset.num_classes}")
print(f"Edge features: {dataset.edge_features}")
print(f"Node features: {dataset.node_features}")
print("======================")

class MLP(torch.nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int, out_channels: int):
        super(MLP, self).__init__()
        self.embed = GCNConv(in_channels, hidden_channels)
        self.classifier = GCNConv(hidden_channels, out_channels)
        self.activation = ReLU()
        self.dropout = Dropout(0.5)

    def forward(self, x, edge_index):
        x = self.embed(x, edge_index)
        h = self.activation(x)
        h = self.dropout(h)
        x = self.classifier(h, edge_index)
        return x, h


model = MLP(dataset.num_features, 32, dataset.num_classes).to(device)
print(model)
print("\n")

def accuracy(logits, labels):
    pred = torch.argmax(logits, dim=1)
    acc = torch.mean((pred == labels).float())
    return acc

criterion = torch.nn.CrossEntropyLoss()  # Define loss criterion.
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)  # Define optimizer.


def train(data: Data):
    optimizer.zero_grad()
    out, h = model.forward(data.x, data.edge_index)
    input = out[data.train_mask]
    target = data.y[data.train_mask]
    loss = criterion(
        input, target
    )
    acc = accuracy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss, h, acc

print("======================")
print("Training...")
for epoch in range(50):
    for data in dataset:
        data.to(device)
        loss, h, acc = train(data)
        print(f"Epoch: {epoch:03d}, Loss: {loss:.4f}, Train Acc: {acc:.4f}")

print("======================")
print("Evaluating...")

def evaluate_train():
    train_accuracy = 0
    for data in dataset:
        data.to(device)
        train_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0][
                data.train_mask
            ],
            data.y[data.train_mask],
        )
    train_accuracy /= len(dataset)
    print(f"Train accuracy: {train_accuracy * 100 : 0.03} %")

def evaluate_test():
    test_accuracy = 0
    for data in dataset:
        data.to(device)
        test_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0][~data.train_mask],
            data.y[~data.train_mask],
        )
    test_accuracy /= len(dataset)
    print(f"Test accuracy: {test_accuracy * 100 : 0.03} %")

def evaluate_total():
    total_accuracy = 0
    for data in dataset:
        data.to(device)
        total_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0],
            data.y,
        )
    total_accuracy /= len(dataset)
    print(f"Total accuracy: {total_accuracy * 100 : 0.03} %")


evaluate_train()
evaluate_test()
evaluate_total()
