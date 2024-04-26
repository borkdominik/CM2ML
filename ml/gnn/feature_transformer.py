from typing import List, Optional
import torch
from torch_geometric.data import Data

from feature_fitter import FeatureFitter

from dataset_types import (
    DatasetDataEntry,
    DatasetMetadata,
    FeatureMetadata,
    FeatureType,
    ProcessedFeatureVector,
    RawFeatureVector,
)


class FeatureTransformer(FeatureFitter):
    def transform_entry(
        self, entry: DatasetDataEntry, metadata: DatasetMetadata
    ) -> Data:
        node_features = entry["nodeFeatureVectors"]
        for node_index, feature_vector in enumerate(node_features):
            node_features[node_index] = self.transform_features(
                feature_vector, metadata["nodeFeatures"]
            )
        edge_index = entry["list"]
        return Data(
            x=torch.tensor(node_features, dtype=torch.float),
            edge_index=torch.tensor(edge_index, dtype=torch.long).transpose(0, 1),
        )

    def transform_features(
        self, feature_vector: RawFeatureVector, metadata: FeatureMetadata
    ) -> ProcessedFeatureVector:
        for index, feature_value in enumerate(feature_vector):
            _, feature_type = metadata[index]
            feature_vector[index] = self.transform_feature(feature_value, feature_type)

    def transform_feature(
        self, feature: Optional[str], feature_type: FeatureType
    ) -> int | float:
        if feature_type == "category":
            # TODO/Jan: Pass categories
            return self.transform_category_feature(feature, [])
        elif feature_type == "string":
            return self.transform_string_feature(feature)
        elif feature_type == "boolean":
            return self.transform_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            return float(feature) if feature is not None else 0
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def transform_category_feature(
        self, feature: Optional[str], categories: List[str]
    ) -> int:
        return categories.index(feature) if feature is not None else 0

    def transform_string_feature(self, feature: Optional[str]) -> int | float:
        return len(feature) if feature is not None else 0

    def transform_boolean_feature(self, feature: Optional[str]) -> int:
        return 1 if feature == "true" else 0
