import time
from typing import List
from numpy import NaN
import torch
from torch_geometric.data import Data

from utils import device, pretty_duration, script_dir


def accuracy(logits: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
    pred = torch.argmax(logits, dim=1)
    acc = torch.mean((pred == labels).float())
    return acc


class BaseModel(torch.nn.Module):
    optimizer: torch.optim.Optimizer
    criterion: torch.nn.Module

    def __init__(self, name: str, accuracy):
        super(BaseModel, self).__init__()
        self.name = name
        self.accuracy = accuracy
        self.checkpoint_file = f"{script_dir}/checkpoints/{name}.pt"

    def forward(self, data: Data):
        raise NotImplementedError

    def __train(self, data: Data) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        self.optimizer.zero_grad()
        out, h = self.forward(data)
        loss = self.criterion(out, data.y)
        acc = self.accuracy(out, data.y)
        loss.backward()
        self.optimizer.step()
        return loss, h, acc

    def fit(
        self,
        train_dataset: List[Data],
        test_dataset: List[Data],
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
            epoch_acc = 0
            for data in train_dataset:
                loss, h, acc = self.__train(data)
                epoch_acc += acc
            self.save(epoch)
            epoch_acc /= len(train_dataset)
            if epoch % 10 == 0:
                print(f"Epoch: {epoch:03d}, Train Acc: {epoch_acc * 100:.2f} %")
            self.eval()
            with torch.no_grad():
                test_loss = 0
                for data in test_dataset:
                    out, h = self.forward(data)
                    test_loss += self.criterion(out, data.y)
                if test_loss < best_loss:
                    best_loss = test_loss
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

    def evaluate_dataset(self, dataset: List[Data]) -> float:
        self.eval()
        total_accuracy = 0
        for data in dataset:
            total_accuracy += self.accuracy(
                self.forward(data)[0],
                data.y,
            )
        if len(dataset) == 0:
            return NaN
        return total_accuracy / len(dataset)

    def evaluate(self, train_dataset: List[Data], test_dataset: List[Data]) -> None:
        print(f"Evaluating {self.name}...")
        train_accuracy = self.evaluate_dataset(train_dataset)
        test_accuracy = self.evaluate_dataset(test_dataset)
        print(f"Train accuracy: {train_accuracy * 100:.2f} %")
        print(f"Test accuracy: {test_accuracy * 100:.2f} %")
