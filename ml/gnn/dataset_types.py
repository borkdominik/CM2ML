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
