import time

from torch_geometric.data import Data


from utils import pretty_duration, resume, save


def train_model(name: str, model, dataset, optimizer, criterion, accuracy, num_epochs, start_epoch=0):
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
        resume(f"{name}-{resume_epoch}.pth")
    print(f"Training {name}...")
    train_start_time = time.perf_counter()
    for epoch in range(start_epoch, num_epochs):
        model.train()
        epoch_acc = 0
        for data in dataset:
            loss, h, acc = train(data)
            epoch_acc += acc
        epoch_acc /= len(dataset)
        if epoch % 100 == 0:
            print(f"Epoch: {epoch:03d}, Train Acc: {epoch_acc:.4f}")
        save(f"{name}-{epoch}.pth", model, optimizer)
    train_end_time = time.perf_counter()
    print(f"Training time: {pretty_duration(train_end_time - train_start_time)}")
