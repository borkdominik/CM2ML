import json
import torch
from torch_geometric.data import Data, InMemoryDataset
from typing import List, Literal, Optional, Tuple, TypeAlias, TypedDict, Union


FeatureType: TypeAlias = Literal["category", "string", "boolean", "integer", "float"]

FeatureMetadata: TypeAlias = List[Tuple[str, FeatureType]]

EdgeIndex: TypeAlias = List[List[int]]

RawFeatureVector: TypeAlias = List[Optional[str]]

class DatasetDataEntry(TypedDict):
    format: Literal["list"]
    list: EdgeIndex
    nodes: List[str]
    nodeFeatureVectors: List[RawFeatureVector]
    edgeFeatureVectors: List[RawFeatureVector]

DatasetData: TypeAlias = dict[str, DatasetDataEntry]

class DatasetMetadata(TypedDict):
    edgeFeatures: FeatureMetadata
    nodeFeatures: FeatureMetadata


class Dataset(TypedDict):
    data: DatasetData
    metadata: DatasetMetadata


ProcessedFeatureVector: TypeAlias = List[Union[int, float]]

class CM2MLDataset(InMemoryDataset):

    feature_encoders = []

    def __init__(self, path: str):
        super().__init__(None)
        entries: List[Data] = []
        with open(path, "r") as file:
            dataset_input: Dataset = json.load(file)
            data = dataset_input['data']
            metadata = dataset_input['metadata']
            self.edge_features  = metadata['edgeFeatures']
            self.node_features = metadata["nodeFeatures"]
            for _, entry in data.items():
                x = entry["nodeFeatureVectors"]
                for j in range(len(x)):
                    for i in range(len(x[j])):
                        x[j][i] = len(x[j][i]) if x[j][i] is not None else 0
                edge_index = entry["list"]
                entry = Data(
                    x=torch.tensor(x, dtype=torch.float),
                    edge_index=torch.tensor(edge_index, dtype=torch.long).transpose(0, 1)
                )
                print(entry)
                entries.append(entry)
        self.data, self.slices = self.collate(entries)

    def normalize_features(self, feature_vector: RawFeatureVector, metadata: FeatureMetadata) -> ProcessedFeatureVector:
        for (index, feature_value) in enumerate(feature_vector):
            _, feature_type = metadata[index]
            feature_vector[index] = self.normalize_feature(feature_value, feature_type)

    def normalize_feature(
        self, feature: Optional[str], feature_type: FeatureType
    ) -> int | float:
        if feature_type == "category":
            # TODO/Jan: Pass categories
            return self.normalize_category_feature(feature, [])
        elif feature_type == "string":
            return self.normalize_string_feature(feature)
        elif feature_type == "boolean":
            return self.normalize_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            return float(feature) if feature is not None else 0
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def normalize_category_feature(
        self, feature: Optional[str], categories: List[str]
    ) -> int:
        return categories.index(feature) if feature is not None else 0

    def normalize_string_feature(self, feature: Optional[str]) -> int | float:
        return len(feature) if feature is not None else 0

    def normalize_boolean_feature(self, feature: Optional[str]) -> int:
        return 1 if feature is not None else 0
