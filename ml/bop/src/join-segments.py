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

script_dir = os.path.dirname(os.path.realpath(__file__))

with open(f"{script_dir}/../../.input/bag-of-paths.json", "r") as file:
    out = {}
    bag_of_paths = json.load(file)
    data = bag_of_paths["data"]
    # every key in data is for a file, iterate over key-value pairs
    for file, entry in data.items():
        paths = entry['paths']
        out[file] = []
        # iterate over paths
        for path in paths:
            out[file].append(join_segments(path))
    out_json = json.dumps(out, indent=2)
    # write to file
    with open(f"{script_dir}/../../.output/bag-of-paths-merged.json", "w") as out_file:
        out_file.write(out_json)


