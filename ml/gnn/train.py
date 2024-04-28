import time

import torch
from torch_geometric.data import Data


from utils import pretty_duration, resume, save


def train_model(
    name: str,
    model,
    train_dataset,
    test_dataset,
    optimizer,
    criterion,
    accuracy,
    num_epochs,
    start_epoch: int,
    patience: int,
    unique_hash: str,
):
    def train(data: Data):
        optimizer.zero_grad()
        out, h = model.forward(data)
        loss = criterion(out, data.y)
        acc = accuracy(out, data.y)
        loss.backward()
        optimizer.step()
        return loss, h, acc

    if start_epoch > 0:
        resume_epoch = start_epoch - 1
        resume(f"{name}-{unique_hash}-{resume_epoch}.pth")

    print(f"Training {name}...")
    train_start_time = time.perf_counter()
    best_loss = float("inf")
    remaining_patience = patience
    for epoch in range(start_epoch, num_epochs):
        model.train()
        epoch_acc = 0
        for data in train_dataset:
            loss, h, acc = train(data)
            epoch_acc += acc
        save(f"{name}-{unique_hash}-{epoch}.pth", model, optimizer)
        epoch_acc /= len(train_dataset)
        if epoch % 100 == 0:
            print(f"Epoch: {epoch:03d}, Train Acc: {epoch_acc * 100:.2f} %")
        model.eval()
        with torch.no_grad():
            test_loss = 0
            for data in test_dataset:
                out, h = model.forward(data)
                test_loss += criterion(out, data.y)
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
