import pickle
from paper.Tree import BinaryTreeManager
from tree_dataset import TreeDataset

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


def add_tokens_from_code(code, vocab):
    tok = str(code["value"])
    if tok not in vocab:
        vocab.append(tok)
    for sub_tree in code["children"]:
        vocab = add_tokens_from_code(sub_tree, vocab)
    return vocab


def get_max_num_children(tree):
    max_num_children = len(tree["children"])
    for child in tree["children"]:
        t = get_max_num_children(child)
        max_num_children = max(t, max_num_children)
    return max_num_children


def calStat(data, serialize):
    if serialize:
        min_len = 10000
        max_len = 0
        avg_len = 0
        for seq in data:
            length = len(seq)
            min_len = min(min_len, length)
            max_len = max(max_len, length)
            avg_len += length
        return min_len, max_len, avg_len * 1.0 / len(data)
    min_len = 0
    max_len = 0
    avg_len = 0
    for tree in data:
        current_len = get_max_num_children(tree)
        avg_len = avg_len + current_len
        max_len = max(max_len, current_len)
    return min_len, max_len, avg_len * 1.0 / len(data)


def build_vocab(train_data, vocab_filename):
    if not vocab_filename:
        source_vocab_list = []
        target_vocab_list = []
        for prog in train_data:
            source_prog = prog["source_ast"]

            target_prog = prog["target_ast"]

            source_vocab_list = add_tokens_from_code(source_prog, source_vocab_list)
            target_vocab_list = add_tokens_from_code(target_prog, target_vocab_list)
        vocab = {}
        vocab["source"] = source_vocab_list
        vocab["target"] = target_vocab_list
    else:
        vocab = pickle.load(open(vocab_filename))
        source_vocab_list = vocab["source"]
        target_vocab_list = vocab["target"]

    source_vocab_list = _START_VOCAB[:] + source_vocab_list
    target_vocab_list = _START_VOCAB[:] + target_vocab_list
    source_vocab_dict = {}
    target_vocab_dict = {}
    for idx, token in enumerate(source_vocab_list):
        source_vocab_dict[token] = idx
    for idx, token in enumerate(target_vocab_list):
        target_vocab_dict[token] = idx
    return source_vocab_dict, target_vocab_dict, source_vocab_list, target_vocab_list


def ast_to_token_ids(code, vocab):
    current = {}
    current["value"] = vocab.get(str(code["value"]), UNK_ID)
    current["children"] = []
    for sub_tree in code["children"]:
        current["children"].append(ast_to_token_ids(sub_tree, vocab))
    return current


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


def raw_program_to_token_ids(prog, vocab):
    return [vocab[str(t)] for t in prog] + [EOS_ID]


def reverse_vocab(vocab):
    reversed_vocab = {}
    for token, idx in vocab.items():
        reversed_vocab[idx] = token
    return reversed_vocab


def idx_to_token(token, reversed_vocab):
    return reversed_vocab.get(token, "none")


def prepare_data(init_data: TreeDataset, source_vocab, target_vocab):
    data = []
    for _index, tree_model in enumerate(init_data.data):
        # print(init_data)
        input = tree_model["x"]["root"]
        label = tree_model["y"]["root"]
        input = ast_to_token_ids(input, source_vocab)
        label = ast_to_token_ids(label, target_vocab)
        data.append((input, label))
        # print("Trees %s" % data)
    data = build_trees(data)
    return data


# init_dataset: list[tuple[TreeNode, TreeNode]]
def build_trees(init_dataset):
    # data_set: list[tuple[TreeNode, TreeNode, TreeManager, TreeManager]]
    data_set: list[tuple] = []
    for source_tree, target_tree in init_dataset:
        source_tree_manager = BinaryTreeManager(source_tree)
        target_tree_manager = BinaryTreeManager(target_tree)
        data_set.append((source_tree, target_tree, source_tree_manager, target_tree_manager))
    return data_set
