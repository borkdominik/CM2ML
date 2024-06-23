from typing import TypedDict, Union

class TreeNode(TypedDict):
    value: Union[str, int]
    children: list["TreeNode"]

class TreeModel(TypedDict):
    root: TreeNode

class TreeDatasetEntry(TypedDict):
    x: TreeModel
    y: TreeModel
