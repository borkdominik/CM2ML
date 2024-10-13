import time
from typing import List
import numpy as np
import torch
from rich.layout import Layout
from torch_geometric.data import Data

from dataset import CM2MLDataset
from layout_proxy import LayoutProxy
from utils import device, pretty_duration, script_dir, text_padding
from sklearn.metrics import classification_report


def accuracy(logits: torch.Tensor, labels: torch.Tensor) -> tuple[torch.Tensor, int]:
    pred = torch.argmax(logits, dim=1)
    correct_predictions = torch.sum((pred == labels).float())
    return correct_predictions, len(logits)


def top_n_accuracy(
    logits: torch.Tensor, labels: torch.Tensor, top_n_classes: List[int]
) -> tuple[torch.Tensor, int, torch.Tensor, int]:
    pred = torch.argmax(logits, dim=1)
    correct_predictions = 0
    top_n_correct_predictions = 0
    top_n_prediction_count = 0
    for i in range(len(pred)):
        if labels[i] in top_n_classes:
            top_n_prediction_count += 1
        if pred[i] == labels[i]:
            correct_predictions += 1
            if labels[i] in top_n_classes:
                top_n_correct_predictions += 1

    return (
        correct_predictions,
        len(logits),
        top_n_correct_predictions,
        top_n_prediction_count,
    )


def weighted_accuracy(
    logits: torch.Tensor, labels: torch.Tensor, weights: List[float]
) -> tuple[torch.Tensor, int, torch.Tensor, int]:
    weighted_correct_predictions = 0
    total_weighted_predictions = 0
    for i in range(len(logits)):
        pred_index = None
        max_value = float("-inf")
        for j in range(len(logits[i])):
            if logits[i][j] > max_value:
                max_value = logits[i][j]
                pred_index = j
        total_weighted_predictions += weights[pred_index]
        if pred_index == labels[i]:
            weighted_correct_predictions += weights[pred_index]
    return (weighted_correct_predictions, total_weighted_predictions)


class BaseModel(torch.nn.Module):
    optimizer: torch.optim.Optimizer
    criterion: torch.nn.Module

    def __init__(self, name: str, layout: Layout):
        super(BaseModel, self).__init__()
        self.name = name
        self.checkpoint_file = f"{script_dir}/../.checkpoints/{name}.pt"
        self.layout_proxy = LayoutProxy(layout, self.name)

    def forward(self, data: Data):
        raise NotImplementedError

    def __train(self, data: Data) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        self.optimizer.zero_grad()
        out = self.forward(data)
        loss = self.criterion(out, data.y)
        correct_predictions, prediction_count = accuracy(out, data.y)
        loss.backward()
        self.optimizer.step()
        return loss, correct_predictions, prediction_count

    def fit(
        self,
        train_dataset: CM2MLDataset,
        validation_dataset: CM2MLDataset,
        num_epochs: int,
        patience: int,
        start_epoch: int = 0,
    ):
        if start_epoch > 0:
            resume_epoch = start_epoch - 1
            self.resume(resume_epoch)

        self.to(device)
        self.layout_proxy.print("Training...")

        train_start_time = time.perf_counter()
        best_loss = float("inf")
        remaining_patience = patience
        for epoch in range(start_epoch, num_epochs):
            self.train()
            epoch_correct_predictions = 0
            epoch_total_prediction_count = 0
            epoch_loss = 0
            for data in train_dataset:
                loss, correct_predictions, prediction_count = self.__train(data)
                epoch_correct_predictions += correct_predictions
                epoch_total_prediction_count += prediction_count
                epoch_loss += loss
            self.save(epoch)
            epoch_accuracy = 0
            if epoch_total_prediction_count > 0:
                epoch_accuracy = (
                    epoch_correct_predictions / epoch_total_prediction_count
                )
            epoch_loss /= len(train_dataset)
            if epoch % 5 == 0:
                self.layout_proxy.print(
                    f"{text_padding}Epoch: {epoch:03d}, Loss: {epoch_loss:.2f}, Acc: {epoch_accuracy:.2%}, Pred: {epoch_correct_predictions:.0f}/{epoch_total_prediction_count}"
                )
            self.eval()
            with torch.no_grad():
                validation_loss = 0
                for data in validation_dataset:
                    out = self.forward(data)
                    validation_loss += self.criterion(out, data.y)
                if validation_loss < best_loss:
                    best_loss = validation_loss
                    remaining_patience = patience
                else:
                    remaining_patience -= 1
                    if remaining_patience == 0:
                        self.layout_proxy.print(
                            f"{text_padding}Early stopping in epoch {epoch}"
                        )
                        break
        train_end_time = time.perf_counter()
        self.layout_proxy.print(
            f"{text_padding}Training time: {pretty_duration(train_end_time - train_start_time)}"
        )
        return self

    def save(self, epoch: int) -> None:
        torch.save(
            {
                "optimizer": self.optimizer.state_dict(),
                "model": self.state_dict(),
            },
            f"{self.checkpoint_file}.{epoch}",
        )

    def resume(self, epoch: int) -> None:
        checkpoint = torch.load(
            f"{self.checkpoint_file}.{epoch}",
        )
        self.load_state_dict(checkpoint["model"])
        self.optimizer.load_state_dict(checkpoint["optimizer"])

    def evaluate_dataset(self, dataset: CM2MLDataset) -> None:
        self.eval()
        total_correct_predictions = 0
        total_prediction_count = 0
        total_top_n_correct_predictions = 0
        total_top_n_prediction_count = 0
        total_weighted_correct_predictions = 0
        total_weighted_prediction_count = 0
        preds = []
        labels = []
        for data in dataset:
            out = self.forward(data)
            preds.extend(out.argmax(dim=1).cpu().numpy())
            labels.extend(data.y.cpu().numpy())
            (
                correct_predictions,
                prediction_count,
                top_n_correct_predictions,
                top_n_prediction_count,
            ) = top_n_accuracy(out, data.y, dataset.top_n_classes)
            total_correct_predictions += correct_predictions
            total_prediction_count += prediction_count
            total_top_n_correct_predictions += top_n_correct_predictions
            total_top_n_prediction_count += top_n_prediction_count
            (weighted_correct_predictions, weighted_prediction_count) = (
                weighted_accuracy(out, data.y, dataset.class_weights)
            )
            total_weighted_correct_predictions += weighted_correct_predictions
            total_weighted_prediction_count += weighted_prediction_count
        total_accuracy = 0
        if total_prediction_count > 0:
            total_accuracy = total_correct_predictions / total_prediction_count
        total_top_n_accuracy = 0
        if total_top_n_prediction_count > 0:
            total_top_n_accuracy = (
                total_top_n_correct_predictions / total_top_n_prediction_count
            )
        total_weighted_accuracy = 0
        if total_weighted_prediction_count > 0:
            total_weighted_accuracy = (
                total_weighted_correct_predictions / total_weighted_prediction_count
            )
        self.layout_proxy.print(
            f"{text_padding}{dataset.name}: Acc: {total_accuracy:.2%}, Pred: {total_correct_predictions:.0f}/{total_prediction_count}, Acc@{dataset.top_n}: {total_top_n_accuracy:.2%}, Pred@{dataset.top_n}: {total_top_n_correct_predictions:.0f}/{total_top_n_prediction_count}, Wgth: {total_weighted_accuracy:.2%}"
        )
        report = classification_report(labels, preds, output_dict=True, zero_division=np.nan)
        return report

    def evaluate(
        self,
        train_dataset: CM2MLDataset,
        validation_dataset: CM2MLDataset,
        test_dataset: CM2MLDataset,
    ):
        self.layout_proxy.print("Evaluating...")
        return {
            "train": self.evaluate_dataset(train_dataset),
            "validation": self.evaluate_dataset(validation_dataset),
            "test": self.evaluate_dataset(test_dataset),
        }
