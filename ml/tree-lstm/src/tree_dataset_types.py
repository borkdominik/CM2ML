from typing import TypedDict

class TreeNode(TypedDict):
    value: str
    children: list["TreeNode"]

class TreeModel(TypedDict):
    root: TreeNode

class TreeDatasetEntry(TypedDict):
    x: TreeModel
    y: TreeModel
