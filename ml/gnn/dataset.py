import json
import torch
from torch_geometric.data import Data, InMemoryDataset

class Dataset(InMemoryDataset):

    def __init__(self, path: str):
        super().__init__(None)
        entries = []
        with open(path, "r") as file:
            record: dict = json.load(file)
            data: dict = record['data']
            metadata: dict = record['metadata']
            self.edge_features = metadata['edgeFeatures']
            self.node_features = metadata['nodeFeatures']
            for key in data:
                values = data[key]
                x = values['nodeFeatureVectors']
                for j in range(len(x)):
                    for i in range(len(x[j])):
                        x[j][i] = len(x[j][i]) if x[j][i] is not None else 0
                edge_index = values['list']
                entry = Data(
                    x=torch.tensor(x, dtype=torch.float),
                    edge_index=torch.tensor(edge_index, dtype=torch.long).transpose(0, 1)
                )
                print(entry)
                entries.append(entry)
        self.data, self.slices = self.collate(entries)
