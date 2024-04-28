import torch
from torch.nn import Dropout, ReLU
from torch_geometric.data import Data
from torch_geometric.nn import GATConv, GCNConv


class GATModel(torch.nn.Module):
    def __init__(
        self,
        num_node_features: int,
        num_edge_features: int,
        hidden_channels: int,
        out_channels: int,
    ):
        super(GATModel, self).__init__()
        self.embed = GATConv(
            num_node_features, hidden_channels, edge_dim=num_edge_features
        )
        self.classifier = GATConv(
            hidden_channels, out_channels, edge_dim=num_edge_features
        )
        self.activation = ReLU()
        self.dropout = Dropout(0.5)

    def forward(self, data: Data):
        x, edge_index, edge_attr = data.x, data.edge_index, data.edge_attr
        x = self.embed(x, edge_index, edge_attr=edge_attr)
        h = self.activation(x)
        h = self.dropout(h)
        x = self.classifier(h, edge_index, edge_attr=edge_attr)
        return x, h

class GCNModel(torch.nn.Module):
    def __init__(
        self,
        num_node_features: int,
        hidden_channels: int,
        out_channels: int,
    ):
        super(GCNModel, self).__init__()
        self.embed = GCNConv(
            num_node_features, hidden_channels
        )
        self.classifier = GCNConv(
            hidden_channels, out_channels
        )
        self.activation = ReLU()
        self.dropout = Dropout(0.5)

    def forward(self, data: Data):
        x, edge_index = data.x, data.edge_index
        x = self.embed(x, edge_index)
        h = self.activation(x)
        h = self.dropout(h)
        x = self.classifier(h, edge_index)
        return x, h
