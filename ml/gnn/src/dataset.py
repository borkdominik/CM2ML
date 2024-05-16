import json
import os
import numpy as np
from rich.layout import Layout
import time
import torch
from torch_geometric.data import InMemoryDataset

from dataset_types import Dataset
from feature_transformer import FeatureTransformer
from layout_proxy import LayoutProxy
from utils import device, pretty_duration, script_dir, text_padding


def softmax(x):
    # From https://stackoverflow.com/a/38250088
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=0)


class CM2MLDataset(InMemoryDataset):
    def __init__(self, name: str, dataset_file: str, layout: Layout):
        super().__init__(None)
        self.name = name

        # To be initialized in print_label_metrics
        self.top_n = 0
        self.top_n_classes = []
        self.class_weights = []

        self.dataset_path = f"{script_dir}/../../dataset/{dataset_file}"
        self.dataset_cache_file = f"{script_dir}/../cache/{dataset_file}.dataset"

        self.is_cached = os.path.isfile(self.dataset_cache_file)

        title = f"{self.name} / {dataset_file}{' (cached)' if self.is_cached else ''}"
        self.layout_proxy = LayoutProxy(layout, title)

    def load(self):
        dataset_load_start_time = time.perf_counter()
        if self.is_cached:
            self.data, self.slices, self.num_nodes, self.metadata = torch.load(
                self.dataset_cache_file
            )
            self.to(device)
        else:
            with open(self.dataset_path, "r") as file:
                dataset_input: Dataset = json.load(file)
                data = dataset_input["data"]
                self.metadata = dataset_input["__metadata__"]
                data_entries = FeatureTransformer().fit_transform(data, self.metadata)
                base_data, slices = self.collate(data_entries)
                self.num_nodes = sum([len(data.x) for data in data_entries])
                torch.save(
                    (base_data, slices, self.num_nodes, self.metadata),
                    self.dataset_cache_file,
                )
                self.data, self.slices = base_data, slices
                self.to(device)

        dataset_load_end_time = time.perf_counter()
        self.layout_proxy.print(
            f"Processed in {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
        )

    def print_metrics(self):
        self.layout_proxy.print(f"{text_padding}# graphs: {len(self)}")
        self.layout_proxy.print(f"{text_padding}# node features: {self.num_features}")
        self.layout_proxy.print(
            f"{text_padding}# edge features: {self.num_edge_features}"
        )
        self.layout_proxy.print(f"{text_padding}# classes: {self.num_classes}")
        self.layout_proxy.print(f"{text_padding}# nodes: {self.num_nodes}")
        self.layout_proxy.print(
            f"{text_padding}⌀ nodes/graph: {self.num_nodes / len(self):.2f}"
        )
        return self

    def print_label_metrics(self, max_num_classes: int):
        self.layout_proxy.print("Counting label occurrences...")
        occurrences = [sum(self._data.y == i).item() for i in range(max_num_classes)]
        total_occurrences = sum(occurrences)
        average = total_occurrences / len(occurrences)
        median = occurrences[len(occurrences) // 2]
        self.layout_proxy.print(f"{text_padding}avg: {average:.2f}")
        self.layout_proxy.print(f"{text_padding}med: {median}")
        min_occurrences, min_index = min(
            (occurrences[i], i) for i in range(1, len(occurrences))
        )
        self.layout_proxy.print(
            f"{text_padding}min: {min_occurrences} ({self.get_label_name_by_index(min_index)})"
        )
        max_occurrences, max_index = max(
            (occurrences[i], i) for i in range(len(occurrences))
        )
        self.layout_proxy.print(
            f"{text_padding}max: {max_occurrences} ({self.get_label_name_by_index(max_index)})"
        )
        self.top_n = 5
        self.top_n_classes = sorted(
            range(len(occurrences)), key=lambda i: occurrences[i], reverse=True
        )[: self.top_n]
        self.layout_proxy.print(
            f"{text_padding}top {self.top_n}: {', '.join(list(map(lambda i: self.get_label_name_by_index(i), self.top_n_classes)))}"
        )
        self.class_weights = [
            (occurrences[i] / total_occurrences) for i in range(len(occurrences))
        ]
        return self

    def get_label_name_by_index(self, index: int) -> str:
        node_features = self.metadata["nodeFeatures"]
        if index == 0:
            return "None"
        label_index = None
        for i, feature in enumerate(node_features):
            if feature[0] == "xmi:type" or feature[0] == "xsi:type":
                label_index = i
                break
        if label_index is None:
            return "Unknown"
        for key, value in node_features[label_index][2].items():
            if value == index:
                return key
        return "Unknown"
