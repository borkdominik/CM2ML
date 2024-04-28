import json
import os
import torch
from torch_geometric.data import InMemoryDataset

from dataset_types import Dataset
from feature_transformer import FeatureTransformer
from utils import device, script_dir


class CM2MLDataset(InMemoryDataset, FeatureTransformer):
    feature_encoders = []

    def __init__(self, dataset_file: str):
        super().__init__(None)
        dataset_path = f"{script_dir}/dataset/{dataset_file}"
        dataset_cache_file = f"{script_dir}/__pycache__/{dataset_file}.dataset"
        if os.path.isfile(dataset_cache_file):
            self.data, self.slices = torch.load(dataset_cache_file)
            self.to(device)
            return
        with open(dataset_path, "r") as file:
            dataset_input: Dataset = json.load(file)
            data = dataset_input["data"]
            metadata = dataset_input["metadata"]
            data_entries = self.fit_transform(data, metadata)
            base_data, slices = self.collate(data_entries)
            torch.save((base_data, slices), dataset_cache_file)
            self.data, self.slices = base_data, slices
            self.to(device)
