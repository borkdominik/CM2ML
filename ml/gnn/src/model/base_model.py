import time
import torch
from torch_geometric.data import Data

from dataset import CM2MLDataset
from utils import device, pretty_duration, script_dir


def accuracy(logits: torch.Tensor, labels: torch.Tensor) -> tuple[torch.Tensor, int]:
    pred = torch.argmax(logits, dim=1)
    correct_predictions = torch.sum((pred == labels).float())
    return correct_predictions, len(logits)


class BaseModel(torch.nn.Module):
    optimizer: torch.optim.Optimizer
    criterion: torch.nn.Module

    def __init__(self, name: str, accuracy):
        super(BaseModel, self).__init__()
        self.name = name
        self.accuracy = accuracy
        self.checkpoint_file = f"{script_dir}/../checkpoints/{name}.pt"

    def forward(self, data: Data):
        raise NotImplementedError

    def __train(self, data: Data) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        self.optimizer.zero_grad()
        out, h = self.forward(data)
        loss = self.criterion(out, data.y)
        correct_predictions, prediction_count = self.accuracy(out, data.y)
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
        print(f"Training {self.name}...")

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
                epoch_accuracy = epoch_correct_predictions / epoch_total_prediction_count
            epoch_loss /= len(train_dataset)
            if epoch % 5 == 0:
                print(
                    f"Epoch: {epoch:03d}, Loss: {epoch_loss:.2f}, Acc: {epoch_accuracy:.2%}, Pred: {epoch_correct_predictions:.0f}/{epoch_total_prediction_count}"
                )
            self.eval()
            with torch.no_grad():
                validation_loss = 0
                for data in validation_dataset:
                    out, h = self.forward(data)
                    validation_loss += self.criterion(out, data.y)
                if validation_loss < best_loss:
                    best_loss = validation_loss
                    remaining_patience = patience
                else:
                    remaining_patience -= 1
                    if remaining_patience == 0:
                        print(f"Early stopping in epoch {epoch}")
                        break
        train_end_time = time.perf_counter()
        print(f"Training time: {pretty_duration(train_end_time - train_start_time)}")
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
        for data in dataset:
            correct_predictions, prediction_count = self.accuracy(
                self.forward(data)[0],
                data.y,
            )
            total_correct_predictions += correct_predictions
            total_prediction_count += prediction_count
        total_accuracy = 0
        if total_prediction_count > 0:
            total_accuracy = total_correct_predictions / total_prediction_count
        print(
            f"\t{dataset.name}\n\t\taccuracy: {total_accuracy:.2%}\n\t\tpredictions: {total_correct_predictions:.0f}/{total_prediction_count}"
        )

    def evaluate(
        self,
        train_dataset: CM2MLDataset,
        validation_dataset: CM2MLDataset,
        test_dataset: CM2MLDataset,
    ):
        print(f"Evaluating {self.name}...")
        self.evaluate_dataset(train_dataset)
        self.evaluate_dataset(validation_dataset)
        self.evaluate_dataset(test_dataset)
        return self
