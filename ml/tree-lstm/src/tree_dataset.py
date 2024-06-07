import copy
import json
import os
import time
from typing import List

import torch
import torch.utils
from tree_dataset_types import TreeDatasetEntry, TreeEncodingEntry
from utils import pretty_duration, script_dir



class TreeDataset(torch.utils.data.Dataset):
    data: List[TreeDatasetEntry]
    def __init__(self, name: str, dataset_file: str) -> None:
        self.dataset_path = f"{script_dir}/../../.input/{dataset_file}"
        self.dataset_cache_file = f"{script_dir}/../.cache/{dataset_file}.dataset"

        self.is_cached = os.path.isfile(self.dataset_cache_file)
        self.load()

    def load(self):
        dataset_load_start_time = time.perf_counter()
        if self.is_cached:
            self.data, self.vocabulary = torch.load(self.dataset_cache_file)
            # TODO?
            # self.to(device)
        else:
            with open(self.dataset_path, "r") as file:
                dataset_input = json.load(file)
                data = dataset_input["data"]
                self.data = list(map(lambda entry: self.create_data(data[entry]), data))
                self.vocabulary: List[str] = dataset_input["__metadata__"]["vocabulary"]
                torch.save(
                    (self.data, self.vocabulary),
                    self.dataset_cache_file,
                )
                # TODO?
                # self.to(device)

        dataset_load_end_time = time.perf_counter()
        print(
            f"Processed in {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
        )

    def create_data(self, entry: TreeEncodingEntry) -> TreeDatasetEntry:
        tree = entry["tree"]
        clone = copy.deepcopy(tree)
        # remove xmi:type and xsi:type
        root = clone["root"]
        classes = root["children"]
        for c in classes:
            attrs = c["children"][1]["children"]
            attrs = [
                attr
                for _, attr in enumerate(attrs)
                if attr["value"] != "xmi:type" and attr["value"] != "xsi:type"
            ]
            c["children"][1]["children"] = attrs
        return {"x": clone, "y": tree}

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]
