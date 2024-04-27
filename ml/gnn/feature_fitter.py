from typing import Optional
from dataset_types import (
    DatasetData,
    DatasetDataEntry,
    DatasetMetadata,
    FeatureMetadata,
    FeatureType,
    RawFeatureVector,
)
from category_encoder import CategoryEncoder


class FeatureFitter:
    def __init__(self) -> None:
        self.encoders: dict[int, CategoryEncoder] = {}

    def get_encoder(self, index: int) -> CategoryEncoder:
        key = f"{index}"
        if key not in self.encoders:
            self.encoders[key] = CategoryEncoder()
        return self.encoders[key]

    def freeze(self) -> None:
        for _, encoder in self.encoders.items():
            encoder.freeze()

    def fit(self, data: DatasetData, metadata: DatasetMetadata) -> None:
        for _, entry in data.items():
            self.fit_entry(entry, metadata)
        self.freeze()

    def fit_entry(self, entry: DatasetDataEntry, metadata: DatasetMetadata) -> None:
        node_features = entry["nodeFeatureVectors"]
        node_feature_metadata = metadata["nodeFeatures"]
        for _, feature_vector in enumerate(node_features):
            self.fit_features(feature_vector, node_feature_metadata)

    def fit_features(
        self, feature_vector: RawFeatureVector, feature_metadata: FeatureMetadata
    ) -> None:
        for feature_index, feature in enumerate(feature_vector):
            _feature_name, feature_type = feature_metadata[feature_index]
            self.fit_feature(feature_index, feature, feature_type)

    def fit_feature(
        self, feature_index: int, feature: Optional[str], feature_type: FeatureType
    ) -> None:
        if feature_type == "category" or feature_type == "string":
            # TODO/Jan: Treat string features as categories for now
            self.fit_category_feature(
                feature,
                feature_index,
            )
        elif feature_type == "string":
            self.fit_string_feature(feature, feature_index)
        elif feature_type == "boolean":
            self.fit_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            pass
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def fit_category_feature(
        self,
        feature: Optional[str],
        feature_index: int,
    ) -> None:
        encoder = self.get_encoder(feature_index)
        if feature is not None:
            encoder.fit(feature)

    def fit_string_feature(
        self,
        feature: Optional[str],
    ) -> None:
        pass

    def fit_boolean_feature(self, feature: Optional[str]) -> None:
        pass
