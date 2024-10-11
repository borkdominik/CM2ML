import torch
from torch.nn import Dropout, ReLU
from torch_geometric.data import Data
from torch_geometric.nn import GATConv

from model.base_model import BaseModel


class GATModel(BaseModel):
    def __init__(
        self,
        num_node_features: int,
        num_edge_features: int,
        hidden_channels: int,
        out_channels: int,
        layout,
    ):
        super(GATModel, self).__init__("GAT", layout=layout)
        embedding_heads = 8
        classification_heads = 8
        self.embed = GATConv(
            in_channels=num_node_features,
            out_channels=hidden_channels,
            edge_dim=num_edge_features,
            heads=embedding_heads,
        )
        self.activation = ReLU()
        self.dropout = Dropout(0.6)
        self.classifier = GATConv(
            in_channels=hidden_channels * embedding_heads,
            out_channels=out_channels,
            edge_dim=num_edge_features,
            heads=classification_heads,
            concat=False,
        )
        self.optimizer = torch.optim.Adam(self.parameters(), lr=0.01)
        self.criterion = torch.nn.CrossEntropyLoss()

    def forward(self, data: Data):
        x, edge_index, edge_attr = data.x, data.edge_index, data.edge_attr
        x = self.embed(x, edge_index, edge_attr=edge_attr)
        h = self.activation(x)
        h = self.dropout(h)
        x = self.classifier(h, edge_index, edge_attr=edge_attr)
        return x
