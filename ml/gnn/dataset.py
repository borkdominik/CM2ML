import json
from torch_geometric.data import InMemoryDataset

from dataset_types import Dataset
from feature_transformer import FeatureTransformer


class CM2MLDataset(InMemoryDataset, FeatureTransformer):
    feature_encoders = []

    def __init__(self, path: str):
        super().__init__(None)
        with open(path, "r") as file:
            dataset_input: Dataset = json.load(file)
            data = dataset_input["data"]
            metadata = dataset_input["metadata"]
            self.edge_features = metadata["edgeFeatures"]
            self.node_features = metadata["nodeFeatures"]
            self.data, self.slices = self.fit_transform(data, metadata)
