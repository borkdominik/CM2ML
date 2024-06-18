import copy
import json
import os
import time
from typing import Union

import torch
import torch.utils
from tree_dataset_types import TreeDatasetEntry, TreeModel
from utils import pretty_duration, script_dir


class TreeDataset(torch.utils.data.Dataset):
    def __init__(self, name: str, dataset_file: str) -> None:
        self.name = name
        self.dataset_path = f"{script_dir}/../../.input/{dataset_file}"
        self.dataset_cache_file = f"{script_dir}/../.cache/{dataset_file}.dataset"
        self.data: list[TreeDatasetEntry] = []

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
                data: dict[str, TreeModel] = dataset_input["data"]
                self.data = list(filter(lambda entry: entry is not None, map(lambda entry: self.create_data(data[entry]), data)))
                self.vocabulary: list[str] = dataset_input["metadata"]["vocabularies"]["vocabulary"]
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

    def create_data(self, tree: TreeModel) -> Union[TreeDatasetEntry, None]:
        if (tree["numNodes"] > 3000):
            return None

        input = copy.deepcopy(tree)
        input_root = input["root"]
        input_root_classes = input_root["children"]
        # remove xmi:type and xsi:type
        for c in input_root_classes:
            attrs = c["children"][1]["children"]
            attrs = [
                attr
                for _, attr in enumerate(attrs)
                if attr["value"] != "xmi:type" and attr["value"] != "xsi:type"
            ]
            c["children"][1]["children"] = attrs

        output = copy.deepcopy(tree)
        output_root = output["root"]
        output_root_classes = output_root["children"]
        # restructure output
        del output_root["isStaticNode"]
        for i, c in enumerate(output_root_classes):
            name = c["children"][0]["children"][0]["value"]
            type = None
            for attr in c["children"][1]["children"]:
                if attr["value"] == "xmi:type" or attr["value"] == "xsi:type":
                    type = attr["children"][0]["value"]
                    break
            if type is None:
                raise ValueError(f"Type not found for class {name}")
            output_root_classes[i] = {"value": type, "children": []}
            # output_root_classes[i] = { "value": name, "children": [{ "value": type, "children": [] }]}
        return {"x": input, "y": output}

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]
