from typing import TypedDict

class TreeNode(TypedDict):
    value: str
    children: list["TreeNode"]

class TreeModel(TypedDict):
    root: TreeNode

class TreeEncodingEntry(TypedDict):
    tree: TreeModel

class TreeDatasetEntry(TypedDict):
    x: TreeModel
    y: TreeModel
