import json
import os
import random
from rich.console import Console
from rich.live import Live
from rich.layout import Layout
import sys
import torch

from dataset import CM2MLDataset
from utils import script_dir, WaitingSpinner
from model.gat import GATModel
from model.gcn import GCNModel

seed = sys.argv[4]

if seed is None:
    exit("Please provide the random seed as an argument")

torch.manual_seed(seed)
random.seed(seed)

train_dataset_file = sys.argv[1]
validation_dataset_file = sys.argv[2]
test_dataset_file = sys.argv[3]

if (
    train_dataset_file is None
    or validation_dataset_file is None
    or test_dataset_file is None
):
    exit(
        "Please provide the train, validation, and test dataset file paths as arguments"
    )

num_epochs = 100
start_epoch = 0
patience = 10

layout = Layout()
layout.split_column(Layout(name="datasets"), Layout(name="models"))
layout["datasets"].split_row(
    Layout(WaitingSpinner("train"), name="train"),
    Layout(WaitingSpinner("validation"), name="validation"),
    Layout(WaitingSpinner("test"), name="test"),
)
layout["models"].split_row(
    Layout(WaitingSpinner("GAT"), name="gat"),
    Layout(WaitingSpinner("GCN"), name="gcn"),
)

with Live(layout, screen=False, redirect_stderr=False, refresh_per_second=4) as live:
    train_dataset = CM2MLDataset(
        "train", train_dataset_file, layout["datasets"]["train"]
    )
    validation_dataset = CM2MLDataset(
        "validation", validation_dataset_file, layout["datasets"]["validation"]
    )
    test_dataset = CM2MLDataset("test", test_dataset_file, layout["datasets"]["test"])

    train_dataset.load()
    validation_dataset.load()
    test_dataset.load()

    max_num_classes = max(
        train_dataset.actual_num_classes,
        validation_dataset.actual_num_classes,
        test_dataset.actual_num_classes,
    )

    num_node_features = train_dataset.num_features
    num_edge_features = train_dataset.num_edge_features

    if (
        train_dataset.num_features != validation_dataset.num_features
        or train_dataset.num_features != test_dataset.num_features
    ):
        exit("Train, validation, or test dataset node features do not match")
    if (
        train_dataset.num_edge_features != validation_dataset.num_edge_features
        or train_dataset.num_edge_features != test_dataset.num_edge_features
    ):
        exit("Train, validation or test dataset edge features do not match")

    gat = GATModel(
        num_node_features=num_node_features,
        num_edge_features=num_edge_features,
        hidden_channels=max_num_classes * 2,
        out_channels=max_num_classes,
        layout=layout["models"]["gat"],
    )
    gcn = GCNModel(
        num_node_features=num_node_features,
        hidden_channels=max_num_classes,
        out_channels=max_num_classes,
        layout=layout["models"]["gcn"],
    )

    train_dataset.print_metrics()
    validation_dataset.print_metrics()
    test_dataset.print_metrics()

    train_dataset.print_and_calculate_label_metrics(max_num_classes)
    validation_dataset.print_and_calculate_label_metrics(max_num_classes)
    test_dataset.print_and_calculate_label_metrics(max_num_classes)

    # gat.evaluate(
    #     train_dataset=train_dataset,
    #     validation_dataset=validation_dataset,
    #     test_dataset=test_dataset,
    # )
    gat.fit(
        train_dataset=train_dataset,
        validation_dataset=validation_dataset,
        num_epochs=num_epochs,
        start_epoch=start_epoch,
        patience=patience,
    )
    gat_report = gat.evaluate(
        train_dataset=train_dataset,
        validation_dataset=validation_dataset,
        test_dataset=test_dataset,
    )

    # gcn.evaluate(
    #     train_dataset=train_dataset,
    #     validation_dataset=validation_dataset,
    #     test_dataset=test_dataset,
    # )
    gcn.fit(
        train_dataset=train_dataset,
        validation_dataset=validation_dataset,
        num_epochs=num_epochs,
        start_epoch=start_epoch,
        patience=patience,
    )
    gcn_report = gcn.evaluate(
        train_dataset=train_dataset,
        validation_dataset=validation_dataset,
        test_dataset=test_dataset,
    )

    output_dir = f"{script_dir}/../../.output/gnn/{seed}"

    def save_report(model_name, report):
        report_dir = f"{output_dir}/{model_name}"
        os.makedirs(report_dir, exist_ok=True)
        for name, value in report.items():
            serialized = json.dumps(value, indent=4)
            with open(f"{report_dir}/{name}.json", "w") as file:
                file.write(serialized)

    console = Console()
    with console.capture() as capture:
        console.print(layout)
    output = capture.get()
    # ensure out dir exists
    os.makedirs(output_dir, exist_ok=True)
    with open(f"{output_dir}/log.txt", "w") as file:
        file.write(output)
    save_report("gat", gat_report)
    save_report("gcn", gcn_report)
