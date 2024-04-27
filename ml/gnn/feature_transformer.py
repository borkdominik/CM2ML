from typing import List, Optional
import torch
from torch_geometric.data import Data

from feature_fitter import FeatureFitter

from dataset_types import (
    DatasetData,
    DatasetDataEntry,
    DatasetMetadata,
    FeatureMetadata,
    FeatureType,
    ProcessedFeatureVector,
    RawFeatureVector,
)


class FeatureTransformer(FeatureFitter):
    def fit_transform(self, datasetData: DatasetData, metadata: DatasetMetadata) -> List[Data]:
        self.fit(datasetData, metadata)
        type_index = list(map(lambda feature: feature[0], metadata["nodeFeatures"])).index("xmi:type")
        entries: List[Data] = []
        for _, entry in datasetData.items():
            data = self.transform_entry(entry, metadata, type_index)
            entries.append(data)
        return entries

    def transform_entry(
        self, entry: DatasetDataEntry, metadata: DatasetMetadata, type_index: int
    ) -> Data:
        node_features = entry["nodeFeatureVectors"]
        for _node_index, feature_vector in enumerate(node_features):
            self.transform_features(
                feature_vector, metadata["nodeFeatures"]
            )
        edge_index = entry["list"]
        actual_types = list(map(lambda features: features[type_index], node_features))
        y = torch.tensor(actual_types, dtype=torch.long)
        # Select a single training node for each community
        # (we just use the first one).
        train_mask = torch.zeros(y.size(0), dtype=torch.bool)
        for i in range(int(y.max()) + 1):
            match = (y == i).nonzero(as_tuple=False)
            if len(match) == 0:
                continue
            train_mask[match[0]] = True
        # train_mask = torch.tensor(
        #     [index % 4 == 0 for index, _ in enumerate(node_features)], dtype=torch.bool
        # )
        return Data(
            x=torch.tensor(node_features, dtype=torch.float),
            y=y,
            edge_index=torch.tensor(edge_index, dtype=torch.long).transpose(0, 1),
            train_mask=train_mask,
        )

    def transform_features(
        self, feature_vector: RawFeatureVector, metadata: FeatureMetadata
    ) -> ProcessedFeatureVector:
        for feature_index, feature_value in enumerate(feature_vector):
            _feature_name, feature_type = metadata[feature_index]
            feature_vector[feature_index] = self.transform_feature(
                feature_value, feature_index, feature_type
            )

    def transform_feature(
        self, feature: Optional[str], feature_index: int, feature_type: FeatureType
    ) -> int | float:
        if feature_type == "category" or feature_type == "string":
            # TODO/Jan: Treat string features as categories for now
            return self.transform_category_feature(feature, feature_index)
        elif feature_type == "string":
            return self.transform_string_feature(feature)
        elif feature_type == "boolean":
            return self.transform_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            return float(feature) if feature is not None else 0
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def transform_category_feature(
        self, feature: Optional[str], feature_index: int
    ) -> int:
        encoder = self.get_encoder(feature_index)
        return encoder.transform(feature)

    def transform_string_feature(self, feature: Optional[str]) -> int:
        return len(feature) if feature is not None else 0

    def transform_boolean_feature(self, feature: Optional[str]) -> int:
        return 1 if feature == "true" else 0
