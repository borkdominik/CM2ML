from typing import List, Optional
import torch
from torch_geometric.data import Data

from feature_fitter import FeatureFitter

from dataset_types import (
    DatasetData,
    DatasetDataEntry,
    DatasetMetadata,
    FeatureMetadata,
    FeatureSource,
    FeatureType,
    ProcessedFeatureVector,
    RawFeatureVector,
)


class FeatureTransformer:
    def __init__(self) -> None:
        super().__init__()
        self.node_feature_fitter = FeatureFitter("nodeFeatureVectors")
        self.edge_feature_fitter = FeatureFitter("edgeFeatureVectors")

    def get_fitter(self, source: FeatureSource) -> FeatureFitter:
        if source == "nodeFeatureVectors":
            return self.node_feature_fitter
        return self.edge_feature_fitter

    def fit_transform(
        self, datasetData: DatasetData, metadata: DatasetMetadata
    ) -> List[Data]:
        all_node_features_encoded = len(list(
            filter(
                lambda feature: not feature[1].startswith("encoded-"),
                metadata["nodeFeatures"],
            )
        )) == 0
        if not all_node_features_encoded:
            self.node_feature_fitter.fit(datasetData, metadata["nodeFeatures"])
        all_edge_features_encoded = (
            len(
                list(
                    filter(
                        lambda feature: not feature[1].startswith("encoded-"),
                        metadata["edgeFeatures"],
                    )
                )
            )
            == 0
        )
        if not all_edge_features_encoded:
            self.edge_feature_fitter.fit(datasetData, metadata["edgeFeatures"])
        type_indices = self.get_type_indices(metadata)
        entries: List[Data] = []
        for _, entry in datasetData.items():
            data = self.transform_entry(
                entry,
                metadata,
                type_indices,
                all_node_features_encoded=all_node_features_encoded,
                all_edge_features_encoded=all_edge_features_encoded,
            )
            entries.append(data)
        return entries

    def get_type_indices(self, metadata: DatasetMetadata) -> list[int]:
        indices = []
        for i, feature in enumerate(metadata["nodeFeatures"]):
            if feature[0] in metadata["typeAttributes"]:
                indices.append(i)
        return indices

    def transform_entry(
        self,
        entry: DatasetDataEntry,
        metadata: DatasetMetadata,
        type_indices: List[int],
        all_node_features_encoded: bool,
        all_edge_features_encoded: bool,
    ) -> Data:
        node_features = entry["nodeFeatureVectors"]
        if not all_node_features_encoded:
            for _node_index, feature_vector in enumerate(node_features):
                self.transform_features(
                    feature_vector, metadata["nodeFeatures"], "nodeFeatureVectors"
                )
        edge_features = entry["edgeFeatureVectors"]
        if not all_edge_features_encoded:
            for _edge_index, feature_vector in enumerate(edge_features):
                self.transform_features(
                    feature_vector, metadata["edgeFeatures"], "edgeFeatureVectors"
                )
        edge_index = entry["list"]
        actual_types = []
        # TODO/Jan: Iterate reversed?
        for _node_index, features in enumerate(node_features):
            type = 0
            for type_index in type_indices:
                type_value = features[type_index]
                features[type_index] = 0
                if type_value != 0:
                    type = type_value
                    break
            actual_types.append(type)
        y = torch.tensor(actual_types, dtype=torch.long)
        # Select a single training node for each community
        # (we just use the first one).
        # train_mask = torch.zeros(y.size(0), dtype=torch.bool)
        # for i in range(int(y.max()) + 1):
        #     match = (y == i).nonzero(as_tuple=False)
        #     if len(match) == 0:
        #         continue
        #     train_mask[match[0]] = True
        # train_mask = torch.tensor(
        #     [index % 4 == 0 for index, _ in enumerate(node_features)], dtype=torch.bool
        # )
        edge_index = (
            torch.tensor(edge_index, dtype=torch.long).transpose(0, 1)
            if len(edge_index) > 0
            else torch.empty((2, 0), dtype=torch.long)
        )
        return Data(
            x=torch.tensor(node_features, dtype=torch.float),
            y=y,
            edge_index=edge_index,
            edge_attr=torch.tensor(edge_features, dtype=torch.float),
            # train_mask=train_mask,
        )

    def transform_features(
        self,
        feature_vector: RawFeatureVector,
        metadata: FeatureMetadata,
        source: FeatureSource,
    ) -> ProcessedFeatureVector:
        for feature_index, feature_value in enumerate(feature_vector):
            _feature_name, feature_type, _ = metadata[feature_index]
            feature_vector[feature_index] = self.transform_feature(
                feature_value, feature_index, feature_type, source
            )

    def transform_feature(
        self,
        feature: Optional[str],
        feature_index: int,
        feature_type: FeatureType,
        source: FeatureSource,
    ) -> int | float:
        if feature_type.startswith("encoded-"):
            return feature
        if feature_type == "category" or feature_type == "string":
            # TODO/Jan: Treat string features as categories for now
            return self.transform_category_feature(feature, feature_index, source)
        elif feature_type == "string":
            return self.transform_string_feature(feature)
        elif feature_type == "boolean":
            return self.transform_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            if feature == "*":
                return -1
            return float(feature) if feature is not None else 0
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def transform_category_feature(
        self, feature: Optional[str], feature_index: int, source: FeatureSource
    ) -> int:
        encoder = self.get_fitter(source).get_encoder(feature_index)
        return encoder.transform(feature)

    def transform_string_feature(self, feature: Optional[str]) -> int:
        return len(feature) if feature is not None else 0

    def transform_boolean_feature(self, feature: Optional[str]) -> int:
        return 1 if feature == "true" else 0
