from typing import Union
import torch
import paper.data_utils as data_utils
from tree_dataset_types import TreeNode


class BinaryTreeNode:
    def __init__(self, value, parent: Union[int, None], depth: int):
        if type(value) == int:  # noqa: E721
            self.value = [value]
            self.value = torch.LongTensor(self.value)
        else:
            self.value = value
        self.lchild: Union[int, None] = None
        self.rchild: Union[int, None] = None
        self.parent = parent
        self.depth = depth
        self.state = None
        self.target = None
        self.prediction = None
        self.attention = None


class BinaryTreeManager:
    def __init__(self, init_tree: Union[TreeNode, None] = None):
        self.nodes: list[BinaryTreeNode] = []
        self.num_nodes = 0
        if init_tree is not None:
            self.__from_dict(init_tree, None, 0)

    def clear_states(self):
        for idx in range(self.num_nodes):
            self.nodes[idx].state = None

    def create_node(self, value, parent: Union[int, None], depth: int) -> int:
        self.nodes.append(BinaryTreeNode(value, parent, depth))
        self.num_nodes += 1
        return self.num_nodes - 1

    def get_node(self, id: int) -> BinaryTreeNode:
        return self.nodes[id]

    def __from_dict(
        self, init_tree: TreeNode, parent: Union[int, None], depth: int
    ) -> int:
        current_id = self.create_node(init_tree["value"], parent, depth)
        num_children = len(init_tree["children"])
        if num_children == 0:
            lchild_id = self.create_node(data_utils.EOS_ID, current_id, depth + 1)
            self.nodes[current_id].lchild = lchild_id
            return current_id
        first_child_id = self.__from_dict(init_tree["children"][0], current_id, depth + 1)
        self.nodes[current_id].lchild = first_child_id
        pre_child_id = first_child_id
        for i in range(1, len(init_tree["children"])):
            current_child_id = self.__from_dict(
                init_tree["children"][i],
                pre_child_id,
                self.nodes[pre_child_id].depth + 1,
            )
            self.nodes[pre_child_id].rchild = current_child_id
            pre_child_id = current_child_id
        current_child_id = self.create_node(
            data_utils.EOS_ID, pre_child_id, self.nodes[pre_child_id].depth + 1
        )
        self.nodes[pre_child_id].rchild = current_child_id
        return current_id
