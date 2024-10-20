import copy
import json
import os
import time
from typing import Union

import torch
import torch.utils
from tree_dataset_types import TreeDatasetEntry, TreeModel, TreeNode
from utils import pretty_duration, script_dir


class TreeDataset(torch.utils.data.Dataset):
    def __init__(self, name: str, dataset_file: str) -> None:
        self.name = name
        self.dataset_path = f"{script_dir}/../../.input/{dataset_file}"
        self.dataset_cache_file = f"{script_dir}/../.cache/{dataset_file}.dataset"
        self.data: list[TreeDatasetEntry] = []
        self.omitted_trees = 0

        self.is_cached = os.path.isfile(self.dataset_cache_file)
        self.load()

    def load(self):
        dataset_load_start_time = time.perf_counter()
        if self.is_cached:
            self.data, self.metadata, self.vocabulary, self.omitted_trees = torch.load(
                self.dataset_cache_file
            )
        else:
            with open(self.dataset_path, "r") as file:
                dataset_input = json.load(file)
                data: dict[str, TreeModel] = dataset_input["data"]
                self.metadata = dataset_input["metadata"]
                self.data = list(
                    filter(
                        lambda entry: entry is not None,
                        map(lambda entry: self.create_data(data[entry]), data),
                    )
                )
                self.vocabulary: list[str] = dataset_input["metadata"]["vocabularies"][
                    "vocabulary"
                ]
                torch.save(
                    (self.data, self.metadata, self.vocabulary, self.omitted_trees),
                    self.dataset_cache_file,
                )

        dataset_load_end_time = time.perf_counter()
        print(
            f"{self.name} processed in {pretty_duration(dataset_load_end_time - dataset_load_start_time)}"
        )
        print(f"{self.name} size: {len(self)} ({self.omitted_trees} trees omitted)")

    def create_data(self, tree: TreeModel) -> Union[TreeDatasetEntry, None]:
        if tree["numNodes"] > 3000:
            self.omitted_trees += 1
            return None
        if tree["format"] == "compact":
            return self.create_data_from_compact_tree(tree)
        elif tree["format"] == "local":
            return self.create_data_from_local_tree(tree)
        elif tree["format"] == "global":
            return self.create_data_from_global_tree(tree)
        else:
            raise ValueError(f"Unknown tree format: {tree['format']}")

    def create_data_from_compact_tree(self, tree: TreeModel) -> TreeDatasetEntry:
        input = copy.deepcopy(tree)
        input_root = input["root"]
        input_root_classes = input_root["children"]
        # remove types from input
        for c in input_root_classes:
            attrs = c["children"][1]["children"]
            attrs = [
                attr
                for _, attr in enumerate(attrs)
                if attr["value"] not in self.metadata["typeAttributes"]
            ]
            c["children"][1]["children"] = attrs

        output = copy.deepcopy(tree)
        output_root = output["root"]
        output_root_classes = output_root["children"]
        # restructure output
        for i, c in enumerate(output_root_classes):
            name = c["value"][0]
            type = None
            for attr in c["children"][0]["children"]:
                if attr["value"] in self.metadata["typeAttributes"]:
                    type = attr["children"][0]["value"]
                    break
            if type is None:
                raise ValueError(
                    f"Type not found for class {name}. Increase the training data size to include samples for every type attribute."
                )
            output_root_classes[i] = {"value": type, "children": []}
        return {"x": input, "y": output}

    def create_data_from_local_tree(self, tree: TreeModel) -> TreeDatasetEntry:
        input = copy.deepcopy(tree)
        input_root = input["root"]
        input_root_classes = input_root["children"]
        # remove types from input
        for c in input_root_classes:
            attrs = c["children"][1]["children"]
            attrs = [
                attr
                for _, attr in enumerate(attrs)
                if attr["value"] not in self.metadata["typeAttributes"]
            ]
            c["children"][1]["children"] = attrs

        output = copy.deepcopy(tree)
        output_root = output["root"]
        output_root_classes = output_root["children"]
        # restructure output
        for i, c in enumerate(output_root_classes):
            name = c["children"][0]["children"][0]["value"]
            type = None
            for attr in c["children"][1]["children"]:
                if attr["value"] in self.metadata["typeAttributes"]:
                    type = attr["children"][0]["value"]
                    break
            if type is None:
                raise ValueError(
                    f"Type not found for class {name}. Increase the training data size to include samples for every type attribute."
                )
            output_root_classes[i] = {"value": type, "children": []}
        return {"x": input, "y": output}

    def create_data_from_global_tree(self, tree: TreeModel) -> TreeDatasetEntry:
        input = copy.deepcopy(tree)
        input_root = input["root"]
        input_root_objects = input_root["children"]
        # remove types from input
        for obj in input_root_objects:
            if not is_obj_node(obj):
                continue
            obj["children"][0]["children"] = []

        output = copy.deepcopy(tree)
        output_root = output["root"]
        output_root_objs = output_root["children"]
        # restructure output
        new_output_root_objs = []
        for i, obj in enumerate(output_root_objs):
            if not is_obj_node(obj):
                continue
            identifier = obj["children"][0]["value"]
            type = obj["children"][0]["children"][0]["value"]
            if type is None:
                raise ValueError(
                    f"Type not found for obj {identifier}. Increase the training data size to include samples for every type attribute."
                )
            new_output_root_objs.append({"value": type, "children": []})
        output_root["children"] = new_output_root_objs
        return {"x": input, "y": output}

    def __len__(self) -> int:
        return len(self.data)

    def __getitem__(self, idx: int) -> TreeDatasetEntry:
        return self.data[idx]


def is_obj_node(treeNode: TreeNode) -> bool:
    return treeNode["value"] == "OBJ"


def print_tree(node: TreeNode):
    print(node["value"])
    for child in node["children"]:
        print_tree(child)
