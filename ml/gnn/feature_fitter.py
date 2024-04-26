from typing import Optional
from dataset_types import (
    DatasetDataEntry,
    DatasetMetadata,
    FeatureMetadata,
    FeatureType,
    RawFeatureVector,
)


class FeatureFitter:
    def fit_entry(self, entry: DatasetDataEntry, metadata: DatasetMetadata) -> None:
        node_features = entry["nodeFeatureVectors"]
        node_feature_metadata = metadata["nodeFeatures"]
        for _, feature_vector in enumerate(node_features):
            self.fit_features(feature_vector, node_feature_metadata)

    def fit_features(
        self, feature_vector: RawFeatureVector, feature_metadata: FeatureMetadata
    ) -> None:
        for feature_index, feature_value in enumerate(feature_vector):
            _, feature_type = feature_metadata[feature_index]
            self.fit_feature(feature_value, feature_type)

    def fit_feature(self, feature: Optional[str], feature_type: FeatureType) -> None:
        if feature_type == "category":
            self.fit_category_feature(feature)
        elif feature_type == "string":
            self.fit_string_feature(feature)
        elif feature_type == "boolean":
            self.fit_boolean_feature(feature)
        elif feature_type == "integer" or feature_type == "float":
            pass
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def fit_category_feature(self, feature: Optional[str]) -> None:
        pass

    def fit_string_feature(self, feature: Optional[str]) -> None:
        pass

    def fit_boolean_feature(self, feature: Optional[str]) -> None:
        pass
