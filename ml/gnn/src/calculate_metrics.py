from decimal import Decimal
import json
import os
from utils import script_dir

report_dir =  f"{script_dir}/../../.output/gnn/"

def dataset_metrics():
    return {
        "f1-score": 0,
        "precision": 0,
        "recall": 0,
        "support": 0,
    }

def method_metrics():
    return {
        "accuracy": 0,
        "weighted avg": dataset_metrics(),
        "macro avg": dataset_metrics(),
    }

def model_metrics():
    return {
        "train": method_metrics(),
        "validation": method_metrics(),
        "test": method_metrics(),
    }
models = {
    "gcn": model_metrics(),
    "gat": model_metrics(),
}

metrics = [ "f1-score", "precision", "recall", "support"]
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
    for model_dir in os.listdir(seed_dir_path):
        model_dir_path = os.path.join(seed_dir_path, model_dir)
        if not os.path.isdir(model_dir_path):
            continue
        for report_file in os.listdir(model_dir_path):
            report_file_path = os.path.join(model_dir_path, report_file)
            if not os.path.isfile(report_file_path):
                continue
            with open(report_file_path, "r") as f:
                serialized = f.read()
                deserialized = json.loads(serialized)
                report_name = report_file.replace(".json", "")
                models[model_dir][report_name]["accuracy"] += deserialized["accuracy"]
                for metric in metrics:
                    for method in methods:
                        models[model_dir][report_name][method][metric] += deserialized[method][metric]

for model in models:
    for dataset in models[model]:
        models[model][dataset]["accuracy"] = float(
            round(Decimal(models[model][dataset]["accuracy"] / num_seeds), 3)
        )
        for method in methods:
            for metric in metrics:
                models[model][dataset][method][metric] = float(
                    round(
                        Decimal(models[model][dataset][method][metric] / num_seeds), 3
                    )
                )

final = json.dumps(models, indent=4)
print(final)
with open(f"{report_dir}/final_report.json", "w") as file:
    file.write(final)
