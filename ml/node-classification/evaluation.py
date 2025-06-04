import json
import time
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report, precision_score, recall_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import balanced_accuracy_score, confusion_matrix
from pathlib import Path

# === CONFIG ===
INPUT_DIR = ".output/triples/C8"
EMBEDDING_DIM = 300
TYPE_VECTOR_LEN = 63
REL_VECTOR_LEN = 11
TEST_SIZE = 0.2
RANDOM_SEED = 42
CV_FOLDS = 5

CONFIG_NAME = Path(INPUT_DIR).name
OUTPUT_DIR = Path("report") / CONFIG_NAME
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def save_confusion_matrix(name, y_test, y_pred, labels):
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
    plt.title(f"Confusion Matrix: {name}")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.tight_layout()
    plt.savefig(OUTPUT_DIR / f"{name}_confusion_matrix.png")
    plt.close()

def save_report_as_csv(name, y_test, y_pred, best_params, train_duration):
    # Per-class metrics
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    per_class_df = pd.DataFrame(report_dict).transpose()
    per_class_df.to_csv(OUTPUT_DIR / f"{name}_per_class_metrics.csv")

    # Global summary metrics
    global_metrics = {
        "best_params": str(best_params),
        "train_time_sec": round(train_duration, 2),
        "accuracy": accuracy_score(y_test, y_pred),
        "balanced_accuracy": balanced_accuracy_score(y_test, y_pred),
        "f1_macro": f1_score(y_test, y_pred, average="macro"),
        "f1_micro": f1_score(y_test, y_pred, average="micro"),
        "f1_weighted": f1_score(y_test, y_pred, average="weighted"),
        "precision_macro": precision_score(y_test, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_test, y_pred, average="macro", zero_division=0)
    }

    global_df = pd.DataFrame([global_metrics])
    global_df.to_csv(OUTPUT_DIR / f"{name}_global_metrics.csv", index=False)


# Remove rare classes with less than min_samples
def filter_rare_classes(X, y, min_samples=5):
    label_counts = Counter(y)
    valid_classes = {label for label, count in label_counts.items() if count >= min_samples}
    
    X_filtered = []
    y_filtered = []
    for xi, yi in zip(X, y):
        if yi in valid_classes:
            X_filtered.append(xi)
            y_filtered.append(yi)
    
    return np.array(X_filtered), np.array(y_filtered)

# === LOAD + PREPARE ===
def load_and_prepare_data(directory_path: str):
    X = []
    y = []

    for file in Path(directory_path).glob("*.json"):
        with open(file, "r") as f:
            data = json.load(f)

        for model in data.get("metadata", []):
            for triple in model.get("triples", []):
                try:
                    source_emb = triple["sourceEmbedding"]
                    rel_type = triple["relationshipType"]
                    target_emb = triple["targetEmbedding"]
                    source_type = triple["sourceType"]
                    target_type = triple["targetType"]

                    if not (len(source_emb) == EMBEDDING_DIM and len(target_emb) == EMBEDDING_DIM):
                        continue
                    if not isinstance(rel_type, list) or len(rel_type) != REL_VECTOR_LEN:
                        continue
                    if not isinstance(target_type, list) or len(target_type) != TYPE_VECTOR_LEN:
                        continue
                    if not isinstance(source_type, list) or len(source_type) != TYPE_VECTOR_LEN:
                        continue

                    vector = source_emb + source_type + rel_type + target_emb
                    label = int(np.argmax(target_type))

                    X.append(vector)
                    y.append(label)

                except KeyError:
                    continue

    return np.array(X), np.array(y)


# === MODEL DEFINITIONS ===
MODELS = {
    "LogisticRegression": {
        "estimator": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, random_state=RANDOM_SEED))
        ]),
        "param_grid": {
            "clf__C": [0.1, 1.0],
            "clf__penalty": ["l2"],
            "clf__solver": ["lbfgs"],
            "clf__class_weight": [None, "balanced"]
        }
    },
    "RandomForest": {
        "estimator": RandomForestClassifier(n_jobs=-1, random_state=RANDOM_SEED),
        "param_grid": {
            "n_estimators": [100],
            "max_depth": [None, 20],
            "class_weight": [None, "balanced"]
        }
    },
    "MLPClassifier": {
        "estimator": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(max_iter=500, early_stopping=True, learning_rate='adaptive', random_state=RANDOM_SEED))
        ]),
        "param_grid": {
            "clf__hidden_layer_sizes": [(256,), (512, 256)],
            "clf__alpha": [1e-4],
        }
    },
}

# === EVALUATION ===
def evaluate_model(name: str, model, params, X_train, y_train, X_test, y_test):
    print(f"\n🔍 Tuning {name}...")
    # select best hyperparameters based on macro F1 score
    grid = GridSearchCV(
        model,
        params,
        cv=StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_SEED),
        scoring="f1_macro",
        n_jobs=-1, # parallelize
        verbose=2 # log each candidate parameter set.
    )
    start_time = time.time()
    grid.fit(X_train, y_train)
    end_time = time.time()
    train_duration = end_time - start_time

    # apply best model on test set
    best_model = grid.best_estimator_
    y_pred = best_model.predict(X_test)

    print(f"\n✅ Best Params for {name}: {grid.best_params_}")
    print(f"🕒 Training Time: {train_duration:.2f} seconds")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"Balanced Accuracy: {balanced_accuracy_score(y_test, y_pred):.4f}")
    print(f"Macro F1: {f1_score(y_test, y_pred, average='macro'):.4f}")
    print(f"Micro F1: {f1_score(y_test, y_pred, average='micro'):.4f}")
    print(f"Weighted F1: {f1_score(y_test, y_pred, average='weighted'):.4f}")
    print("Macro Precision:", precision_score(y_test, y_pred, average='macro'))
    print("Macro Recall:", recall_score(y_test, y_pred, average='macro'))
    print("\n📊 Per-Class Metrics:")
    print(classification_report(y_test, y_pred, zero_division=0))

    save_confusion_matrix(name, y_test, y_pred, labels=sorted(set(y_test)))
    save_report_as_csv(name, y_test, y_pred, best_params=grid.best_params_, train_duration=train_duration)

# === MAIN ===
def main():
    print("📦 Loading data...")
    X, y = load_and_prepare_data(INPUT_DIR)
    print(f"✅ Loaded {len(X)} samples with {X.shape[1]} features.")
    X, y = filter_rare_classes(X, y, min_samples=5)
    print(f"✅ Filtered to {len(X)} samples with {len(set(y))} classes.")

    # split into train and test sets, stratified by label
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_SEED
    )

    for model_name, cfg in MODELS.items():
        evaluate_model(model_name, cfg["estimator"], cfg["param_grid"], X_train, y_train, X_test, y_test)

if __name__ == "__main__":
    main()