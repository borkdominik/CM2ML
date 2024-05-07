import torch
from torch.nn import Dropout, ReLU
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

from model.base_model import BaseModel, accuracy


class GCNModel(BaseModel):
    def __init__(
        self,
        num_node_features: int,
        hidden_channels: int,
        out_channels: int,
    ):
        super(GCNModel, self).__init__("GCN", accuracy=accuracy)
        self.embed = GCNConv(num_node_features, hidden_channels)
        self.activation = ReLU()
        self.dropout = Dropout(0.1)
        self.classifier = GCNConv(hidden_channels, out_channels)
        self.optimizer = torch.optim.Adam(self.parameters(), lr=0.01)
        self.criterion = torch.nn.CrossEntropyLoss()

    def forward(self, data: Data):
        x, edge_index = data.x, data.edge_index
        x = self.embed(x, edge_index)
        h = self.activation(x)
        h = self.dropout(h)
        x = self.classifier(h, edge_index)
        return x, h
