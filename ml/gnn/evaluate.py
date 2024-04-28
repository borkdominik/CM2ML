
def evaluate_dataset(model, dataset, accuracy) -> float:
    model.eval()
    total_accuracy = 0
    for data in dataset:
        total_accuracy += accuracy(
            model.forward(data)[0],
            data.y,
        )
    return total_accuracy / len(dataset)

def evaluate_model(name: str, model, train_dataset, test_dataset, accuracy) -> None:
    print(f"Evaluating {name}...")
    train_accuracy = evaluate_dataset(model, train_dataset, accuracy)
    test_accuracy = evaluate_dataset(model, test_dataset, accuracy)
    print(f"Train accuracy: {train_accuracy * 100:.2f} %")
    print(f"Test accuracy: {test_accuracy * 100:.2f} %")
