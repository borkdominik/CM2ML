from typing import List, TypedDict

class TreeNode(TypedDict):
    value: str
    children: List["TreeNode"]

class TreeModel(TypedDict):
    root: TreeNode

class TreeEncodingEntry(TypedDict):
    tree: TreeModel

class TreeDatasetEntry(TypedDict):
    x: TreeModel
    y: TreeModel
