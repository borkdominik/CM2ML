import torch
from torch import cuda
from torch.autograd import Variable
import paper.data_utils as data_utils


class BinaryTree(object):
    def __init__(self, root, parent, depth):
        if type(root) == int:  # noqa: E721
            self.root = [root]
            self.root = Variable(torch.LongTensor(self.root))
        else:
            self.root = root
        self.lchild = None
        self.rchild = None
        self.parent = parent
        self.depth = depth
        self.state = None
        self.target = None
        self.prediction = None
        self.attention = None


class Tree(object):
    def __init__(self, root, parent, depth):
        self.root = root
        self.children = []
        self.parent = parent
        self.depth = depth


class TreeManager(object):
    def __init__(self):
        self.clear()

    def clear(self):
        self.trees = []
        self.num_trees = 0

    def clear_states(self):
        for idx in range(self.num_trees):
            self.trees[idx].state = None

    def create_binary_tree(self, root, parent, depth):
        self.trees.append(BinaryTree(root, parent, depth))
        self.num_trees += 1
        return self.num_trees - 1

    def create_tree(self, root, parent, depth):
        self.trees.append(Tree(root, parent, depth))
        self.num_trees += 1
        return self.num_trees - 1

    def get_tree(self, id):
        return self.trees[id]

    def build_binary_tree_from_dict(self, init_tree, parent=None, depth=0):
        current_id = self.create_binary_tree(init_tree["value"], parent, depth)
        num_children = len(init_tree["children"])
        if num_children == 0:
            lchild_id = self.create_binary_tree(
                data_utils.EOS_ID, current_id, depth + 1
            )
            self.trees[current_id].lchild = lchild_id
            return current_id
        first_child_id = self.build_binary_tree_from_dict(
            init_tree["children"][0], current_id, depth + 1
        )
        self.trees[current_id].lchild = first_child_id
        pre_child_id = first_child_id
        for i in range(1, len(init_tree["children"])):
            current_child_id = self.build_binary_tree_from_dict(
                init_tree["children"][i],
                pre_child_id,
                self.trees[pre_child_id].depth + 1,
            )
            self.trees[pre_child_id].rchild = current_child_id
            pre_child_id = current_child_id
        current_child_id = self.create_binary_tree(
            data_utils.EOS_ID, pre_child_id, self.trees[pre_child_id].depth + 1
        )
        self.trees[pre_child_id].rchild = current_child_id
        return current_id

    def build_tree_from_dict(self, init_tree, target_len, parent=None, depth=0):
        root = []
        root.append(data_utils.GO_ID)
        root.append(init_tree["root"])
        children = []
        current_id = self.create_tree(root, parent, depth)
        for child in init_tree["children"]:
            root.append(data_utils.NT_ID)
            child_id = self.build_tree_from_dict(
                child, target_len, current_id, depth + 1
            )
            children.append(child_id)
        root.append(data_utils.EOS_ID)
        if len(root) < target_len:
            root = root + [data_utils.PAD_ID] * (target_len - len(root))
        root = Variable(torch.LongTensor(root))
        if cuda.is_available():
            root = root.cuda()
        self.trees[current_id].root = root
        self.trees[current_id].children = children

        return current_id
