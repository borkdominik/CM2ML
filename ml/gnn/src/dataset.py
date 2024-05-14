import json
import os
import time
import torch
from torch_geometric.data import InMemoryDataset

from dataset_types import Dataset
from feature_transformer import FeatureTransformer
from utils import device, pretty_duration, script_dir


class CM2MLDataset(InMemoryDataset):

    def __init__(self, name: str, dataset_file: str):
        super().__init__(None)
        self.name = name

        print(f"{self.name}:", dataset_file)

        dataset_path = f"{script_dir}/../../dataset/{dataset_file}"
        dataset_cache_file = f"{script_dir}/../cache/{dataset_file}.dataset"

        dataset_load_start_time = time.perf_counter()
        if os.path.isfile(dataset_cache_file):
            print("Loading dataset from cache...")
            self.data, self.slices, self.num_nodes = torch.load(dataset_cache_file)
            self.to(device)
        else:
            print("Loading dataset...")
            with open(dataset_path, "r") as file:
                dataset_input: Dataset = json.load(file)
                data = dataset_input["data"]
                metadata = dataset_input["__metadata__"]
                data_entries = FeatureTransformer().fit_transform(data, metadata)
                base_data, slices = self.collate(data_entries)
                self.num_nodes = sum([len(data.x) for data in data_entries])
                torch.save((base_data, slices, self.num_nodes), dataset_cache_file)
                self.data, self.slices = base_data, slices
                self.to(device)

        dataset_load_end_time = time.perf_counter()
        print(
            f"{self.name} dataset load time: {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
        )

    def print_metrics(self):
        print(f"\tNumber of graphs: {len(self)}")
        print(f"\tNumber of node features: {self.num_features}")
        print(f"\tNumber of edge features: {self.num_edge_features}")
        print(f"\tNumber of classes: {self.num_classes}")
        print(f"\tNumber of nodes: {self.num_nodes}")
        print(f"\tAverage number of nodes per graph: {self.num_nodes / len(self):.2f}")
        return self
