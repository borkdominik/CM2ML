from decimal import Decimal
import json
import os

import numpy as np
from utils import script_dir

report_dir = f"{script_dir}/../../.output/tree-lstm/"


def dataset_metrics():
    return {
        "f1-score": [],
        "precision": [],
        "recall": [],
        "support": [],
    }


def method_metrics():
    return {
        "accuracy": [],
        "weighted avg": dataset_metrics(),
        "macro avg": dataset_metrics(),
    }


def model_metrics():
    return {
        # "train": method_metrics(),
        # "validation": method_metrics(),
        "test": method_metrics(),
    }


out = model_metrics()

metrics = ["f1-score", "precision", "recall", "support"]
methods = ["weighted avg", "macro avg"]

# for every subdir in report_dir
#   for every file in subdir
#     read file
num_seeds = 0
for seed_dir in os.listdir(report_dir):
    seed_dir_path = os.path.join(report_dir, seed_dir)
    if not os.path.isdir(seed_dir_path):
        continue
    num_seeds += 1
    for report_file in os.listdir(seed_dir_path):
        report_file_path = os.path.join(seed_dir_path, report_file)
        if not os.path.isfile(report_file_path):
            continue
        with open(report_file_path, "r") as f:
            serialized = f.read()
            deserialized = json.loads(serialized)
            report_name = report_file.replace(".json", "")
            out[report_name]["accuracy"].append(deserialized["accuracy"])
            for metric in metrics:
                for method in methods:
                    out[report_name][method][metric].append(
                        deserialized[method][metric]
                    )


def round_dec(value, digits=3):
    return float(round(Decimal(value * 100), digits))


for dataset in out:
    avg_acc = round_dec(np.mean(out[dataset]["accuracy"]))
    acc_var = round_dec(np.std(out[dataset]["accuracy"]))
    out[dataset]["accuracy"] = {
        "mean": avg_acc,
        "std": acc_var,
    }
    for method in methods:
        for metric in metrics:
            mean = round_dec(np.mean(out[dataset][method][metric]))
            variance = round_dec(np.std(out[dataset][method][metric]))
            out[dataset][method][metric] = {
                "mean": mean,
                "std": variance,
            }

final = json.dumps(out, indent=4)
print(final)
with open(f"{report_dir}/final_report.json", "w") as file:
    file.write(final)
