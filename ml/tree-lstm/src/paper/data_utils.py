from typing import TypeAlias, TypedDict
from paper.binary_tree import BinaryTreeManager
from tree_dataset import TreeDataset
from tree_dataset_types import TreeNode

# Special vocabulary symbols
_PAD = b"_PAD"
_GO = b"_GO"
_EOS = b"_EOS"
_UNK = b"_UNK"
_NT = b"_NT"
_LEFT_BRACKET = b"("
_RIGHT_BRACKET = b")"
_START_VOCAB = [_PAD, _GO, _EOS, _UNK, _NT, _LEFT_BRACKET, _RIGHT_BRACKET]

PAD_ID = 0
GO_ID = 1
EOS_ID = 2
UNK_ID = 3
NT_ID = 4
LEFT_BRACKET_ID = 5
RIGHT_BRACKET_ID = 6

Vocab: TypeAlias = dict[str, int]


class EncodedTreeNode(TypedDict):
    value: int
    children: list["EncodedTreeNode"]


def add_tokens_from_source_node(node: TreeNode, vocab: list[str]):
    tok = str(node["value"])
    if tok not in vocab:
        vocab.append(tok)
    for child_node in node["children"]:
        vocab = add_tokens_from_source_node(child_node, vocab)
    return vocab

def add_tokens_from_target_node(node: TreeNode, vocab: list[str], classes: dict[str, int], is_root=True):
    tok = str(node["value"])
    if tok not in vocab:
        vocab.append(tok)
    if not is_root:
        if tok in classes:
            classes[tok] += 1
        else:
            classes[tok] = 1

    for child_node in node["children"]:
        vocab, classes = add_tokens_from_target_node(child_node, vocab, classes, False)
    return vocab, classes


def build_vocab(
    datasets: list[TreeDataset],
) -> tuple[Vocab, Vocab]:
    source_vocab_list: list[str] = []
    target_vocab_list: list[str] = []
    classes: dict[str, int] = {}
    for dataset in datasets:
        for entry in dataset.data:
            source_tree = entry["x"]["root"]
            target_tree = entry["y"]["root"]
            source_vocab_list = add_tokens_from_source_node(
                source_tree, source_vocab_list
            )
            target_vocab_list, classes = add_tokens_from_target_node(
                target_tree, target_vocab_list, classes
            )
    source_vocab_list = _START_VOCAB[:] + source_vocab_list
    target_vocab_list = _START_VOCAB[:] + target_vocab_list
    source_vocab_dict: Vocab = {}
    target_vocab_dict: Vocab = {}
    for idx, token in enumerate(source_vocab_list):
        source_vocab_dict[token] = idx
    for idx, token in enumerate(target_vocab_list):
        target_vocab_dict[token] = idx
    return source_vocab_dict, target_vocab_dict, classes

def get_class_name(class_name: str, metadata):
    split = class_name.split("_", 2)
    encoded_type = split[-1]
    attribute_name, _, index_string = (
        [metadata["typeAttributes"][0], "category", encoded_type]
        if len(split) == 1
        else split
    )
    values = [values for name, _, values in metadata["nodeFeatures"] if name == attribute_name][0]
    class_index = int(index_string)
    for value, index in values.items():
        if index == class_index:
            return value
    return None

def get_top_n_classes(classes: dict[str, int], n: int, metadata):
    top_n = sorted(classes.items(), key=lambda x: x[1], reverse=True)[:n]
    print(f"Top {n} classes:")
    for class_name, count in top_n:
        print(f"{get_class_name(class_name, metadata)}: {count}")


def values_to_token_ids(tree_node: TreeNode, vocab: Vocab) -> EncodedTreeNode:
    tree_node["value"] = vocab.get(str(tree_node["value"]), UNK_ID)
    for sub_tree in tree_node["children"]:
        values_to_token_ids(sub_tree, vocab)
    return tree_node


def serialize_tree(tree):
    current = []
    current.append(LEFT_BRACKET_ID)
    current.append(tree["value"])
    if len(tree["children"]) > 0:
        for sub_tree in tree["children"]:
            child = serialize_tree(sub_tree)
            current = current + child
    current.append(RIGHT_BRACKET_ID)
    return current


def serialize_seq_with_vocabulary(seq, vocabulary):
    reversed_vocabulary = reverse_vocab(vocabulary)
    new_seq = []
    for elem in seq:
        if elem != LEFT_BRACKET_ID and elem != RIGHT_BRACKET_ID:
            new_seq.append(idx_to_token(elem, reversed_vocabulary))
    return new_seq


def serialize_tree_with_vocabulary(tree, vocabulary):
    reversed_vocabulary = reverse_vocab(vocabulary)
    return serialize_tree_with_vocabulary_aux(tree, reversed_vocabulary)


def serialize_tree_with_vocabulary_aux(tree, reversed_vocabulary):
    current = []
    # current.append("(")
    current.append(idx_to_token(tree["value"], reversed_vocabulary))
    if len(tree["children"]) > 0:
        for sub_tree in tree["children"]:
            child = serialize_tree_with_vocabulary_aux(sub_tree, reversed_vocabulary)
            current = current + child
    # current.append(")")
    return current


def reverse_vocab(vocab: Vocab) -> dict[int, str]:
    reversed_vocab = {}
    for token, idx in vocab.items():
        reversed_vocab[idx] = token
    return reversed_vocab


def idx_to_token(token: int, reversed_vocab: dict[int, str]):
    return reversed_vocab.get(token, "none")


EncodedDataset: TypeAlias = list[
    tuple[EncodedTreeNode, EncodedTreeNode, BinaryTreeManager, BinaryTreeManager]
]


def prepare_data(
    init_data: TreeDataset, source_vocab: Vocab, target_vocab: Vocab
) -> EncodedDataset:
    data: EncodedDataset = []
    for _index, tree_model in enumerate(init_data.data):
        input = tree_model["x"]["root"]
        label = tree_model["y"]["root"]
        input = values_to_token_ids(input, source_vocab)
        label = values_to_token_ids(label, target_vocab)
        data.append((input, label, BinaryTreeManager(input), BinaryTreeManager(label)))
    return data
