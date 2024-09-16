import json
import os
import random

sep = '$eu.yeger$'

def join_segments(path, is_masked):
    result = []
    labels = []
    nodes = path["nodes"]
    edges = path["edges"]
    for index, node in enumerate(nodes):
        if index > 0:
            result.append(edges[index - 1])
        if is_masked(node[0]):
            type, masked = mask(node[1])
            result.append(masked)
            labels.append(type)
        else:
            result.append(unmask(node[1]))
    return " ".join(result), labels

def mask(string):
    start = string.index(sep) + len(sep)
    end = string.index(sep, start)
    type = string[start:end]
    return type, string[:start - len(sep)] + "<MASKED>" + string[end + len(sep):]

def unmask(string):
    start = string.index(sep) + len(sep)
    end = string.index(sep, start)
    type = string[start:end]
    return string[:start - len(sep)] + type + string[end + len(sep):]

def contains_duplicate(out, path_strings):
    for _, other in out.items():
        if len(other) == len(path_strings):
            for index, path_string in enumerate(path_strings):
                if path_string == other[index]:
                    return True
    return False

def prepare_entry(entry, is_masked):
    paths = entry['paths']
    path_strings = []
    # iterate over paths
    for path in paths:
        path_strings.append(join_segments(path, is_masked))
    return path_strings

def collect_nodes(entry):
    nodes = []
    paths = entry['paths']
    for path in paths:
        for node in path['nodes']:
            nodes.append(node[0])
    return nodes

script_dir = os.path.dirname(os.path.realpath(__file__))

with open(f"{script_dir}/../../.input/bag-of-paths.json", "r") as file:
    out = {}
    bag_of_paths = json.load(file)
    data = bag_of_paths["data"]
    deterministicRandom = random.Random(4)
    # every key in data is for a file, iterate over key-value pairs
    for file, entry in data.items():
        nodes = collect_nodes(entry)
        deterministicRandom.shuffle(nodes)
        def is_masked(index):
            # 80% unmasked, 20% masked
            return nodes.index(index) < 0.2 * len(nodes)
        path_strings = prepare_entry(entry, is_masked)
        if len(path_strings) > 0 and not contains_duplicate(out, path_strings):
            out[file] = path_strings
    out_json = json.dumps(out, indent=2)
    # write to file
    with open(f"{script_dir}/../../.output/bag-of-paths-merged.json", "w") as out_file:
        out_file.write(out_json)


