import time
import torch
from torch.nn import Dropout, ReLU
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

from dataset import CM2MLDataset
from utils import pretty_duration, script_dir

torch.manual_seed(140)

dataset_file = "test.json"
n_epochs = 100
start_epoch = 0
use_mps = False and torch.backends.mps.is_available() and torch.backends.mps.is_built()

device = torch.device("mps" if use_mps else "cpu")
print(f"Using device: {device}")

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


model = MLP(dataset.num_features, 128, dataset.num_classes).to(device)
print(model)
print("\n")


def accuracy(logits, labels):
    pred = torch.argmax(logits, dim=1)
    acc = torch.mean((pred == labels).float())
    return acc


criterion = torch.nn.CrossEntropyLoss()  # Define loss criterion.
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)  # Define optimizer.

checkpoint_dir = f"{script_dir}/checkpoints"

def save(filename: str):
    torch.save(
        {
            "optimizer": optimizer.state_dict(),
            "model": model.state_dict(),
        },
        f"{checkpoint_dir}/{filename}",
    )


def resume(filename: str):
    checkpoint = torch.load(
        f"{checkpoint_dir}/{filename}",
    )
    model.load_state_dict(checkpoint["model"])
    optimizer.load_state_dict(checkpoint["optimizer"])


def evaluate_train() -> float:
    train_accuracy = 0
    for data in train_dataset:
        train_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0],
            data.y,
        )
    return train_accuracy / len(train_dataset)


def evaluate_test() -> float:
    test_accuracy = 0
    for data in test_dataset:
        test_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0],
            data.y,
        )
    return test_accuracy / len(test_dataset)


def evaluate_total() -> float:
    total_accuracy = 0
    for data in dataset:
        total_accuracy += accuracy(
            model.forward(data.x, data.edge_index)[0],
            data.y,
        )
    return total_accuracy / len(dataset)


if start_epoch > 0:
    resume_epoch = start_epoch - 1
    resume(f"epoch-{resume_epoch}.pth")


def train(data: Data):
    optimizer.zero_grad()
    out, h = model.forward(data.x, data.edge_index)
    loss = criterion(out, data.y)
    acc = accuracy(out, data.y)
    loss.backward()
    optimizer.step()
    return loss, h, acc


print("======================")
print("Training...")
train_start_time = time.perf_counter()
for epoch in range(start_epoch, n_epochs):
    model.train()
    epoch_acc = 0
    for data in train_dataset:
        data.to(device)
        loss, h, acc = train(data)
        epoch_acc += acc
    epoch_acc /= len(train_dataset)
    print(f"Epoch: {epoch:03d}, Train Acc: {epoch_acc:.4f}")
    save(f"epoch-{epoch}.pth")
train_end_time = time.perf_counter()
print(f"Training time: {pretty_duration(train_end_time - train_start_time)}")
model.eval()

print("======================")
print("Evaluating...")
evaluating_start_time = time.perf_counter()
train_accuracy = evaluate_train()
print(f"Train accuracy: {train_accuracy * 100 : 0.03} %")
test_accuracy = evaluate_test()
print(f"Test accuracy: {test_accuracy * 100 : 0.03} %")
total_accuracy = evaluate_total()
print(f"Total accuracy: {total_accuracy * 100 : 0.03} %")
evaluating_end_time = time.perf_counter()
print(
    f"Evaluation time: {pretty_duration(evaluating_end_time - evaluating_start_time)}"
)
