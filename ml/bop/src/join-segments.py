import json
import os

def join_segments(path):
    result = []
    nodes = path["nodes"]
    edges = path["edges"]
    for index, node in enumerate(nodes):
        if index > 0:
            result.append(edges[index - 1])
        result.append(node[1])
    return " ".join(result)

def contains_duplicate(out, path_strings):
    for _, other in out.items():
        if len(other) == len(path_strings):
            for index, path_string in enumerate(path_strings):
                if path_string == other[index]:
                    return True
    return False


script_dir = os.path.dirname(os.path.realpath(__file__))

with open(f"{script_dir}/../../.input/bag-of-paths.json", "r") as file:
    out = {}
    bag_of_paths = json.load(file)
    data = bag_of_paths["data"]
    # every key in data is for a file, iterate over key-value pairs
    for file, entry in data.items():
        paths = entry['paths']
        path_strings = []
        # iterate over paths
        for path in paths:
            path_strings.append(join_segments(path))
        if len(path_strings) > 0 and not contains_duplicate(out, path_strings):
            out[file] = path_strings
    out_json = json.dumps(out, indent=2)
    # write to file
    with open(f"{script_dir}/../../.output/bag-of-paths-merged.json", "w") as out_file:
        out_file.write(out_json)


