import json
from typing import List
from torch_geometric.data import Data, InMemoryDataset

from dataset_types import Dataset
from feature_transformer import FeatureTransformer


class CM2MLDataset(InMemoryDataset, FeatureTransformer):
    feature_encoders = []

    def __init__(self, path: str):
        super().__init__(None)
        entries: List[Data] = []
        with open(path, "r") as file:
            dataset_input: Dataset = json.load(file)
            data = dataset_input["data"]
            metadata = dataset_input["metadata"]
            self.edge_features = metadata["edgeFeatures"]
            self.node_features = metadata["nodeFeatures"]
            for _, entry in data.items():
                self.fit_entry(entry, metadata)
            for _, entry in data.items():
                data = self.transform_entry(entry, metadata)
                entries.append(data)
        self.data, self.slices = self.collate(entries)
