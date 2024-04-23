import torch
from torch_geometric.datasets import KarateClub
from torch.nn import Dropout, Tanh, ReLU  # import the torch layers
from torch_geometric.nn import GCNConv

torch.manual_seed(140)

use_mps = False and torch.backends.mps.is_available() and torch.backends.mps.is_built()

device = torch.device("mps" if use_mps else "cpu")
print(f"Using device: {device}")
dataset = KarateClub()
print(f"Dataset: {dataset}:")
print("======================")

# There can be one or more number of graphs in a dataset
# In this case it is only 1.
print(f"Number of graphs: {len(dataset)}")
print(f"Number of features: {dataset.num_features}")

# Node labels are the labels of the community that the node ends up joining
# These labels are obtained by via modularity-based clustering
print(f"Number of classes: {dataset.num_classes}")
karate_club = dataset[0]  # Get the dataset graph
karate_club.to(device)
print("======================\n\n")

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

out, h = model.forward(karate_club.x, karate_club.edge_index)

def accuracy(logits, labels):
    # find the accuracy
    pred = torch.argmax(logits, dim=1)
    acc = torch.mean((pred == labels).float())
    return acc

init_acc = accuracy(out, karate_club.y).item() * 100
print(f"The initial accuracy {init_acc:0.03} %")

criterion = torch.nn.CrossEntropyLoss()  # Define loss criterion.
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)  # Define optimizer.

def train(data):
    optimizer.zero_grad()
    out, h = model.forward(data.x, data.edge_index)
    loss = criterion(
        out[data.train_mask], data.y[data.train_mask]
    )  # Compute the loss solely based on the training nodes.
    acc = accuracy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    return loss, h, acc

for epoch in range(180):
    for data in dataset:
        data.to(device)
        loss, h, acc = train(data)

train_accuracy = accuracy(
    model.forward(karate_club.x, karate_club.edge_index)[0][karate_club.train_mask],
    karate_club.y[karate_club.train_mask],
)
test_accuracy = accuracy(
    model.forward(karate_club.x, karate_club.edge_index)[0][~karate_club.train_mask],
    karate_club.y[~karate_club.train_mask],
)
total_accuracy = accuracy(
    model.forward(karate_club.x, karate_club.edge_index)[0], karate_club.y
)

print(f"Train accuracy: {train_accuracy * 100 : 0.03} %")
print(f"Test accuracy: {test_accuracy * 100 : 0.03} %")
print(f"Dataset accuracy: {total_accuracy * 100 : 0.03} %")
