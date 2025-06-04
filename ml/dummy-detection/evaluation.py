import json
import time
import numpy as np
import pandas as pd
import glob
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_validate, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score, accuracy_score, precision_score, recall_score

ENCODING_FILES = glob.glob(".output/encodings/*.json")
ENCODING_OUTPUT_PATH = Path('.output/C0_1.json')
LABELS_PATH = Path('.output/labels.json')
# random seed for reproducibility
RANDOM_SEED = 42

def load_encoding(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    term_matrix = data["metadata"]["termDocumentMatrix"]
    term_list = data["metadata"]["termList"]
    
    # Convert to DataFrame
    df = pd.DataFrame.from_dict(term_matrix, orient='index', columns=term_list)
    df.index.name = "model_view_id"
    
    return df

def load_labels(file_path):
    with open(file_path, 'r') as f:
        labels = json.load(f)
    
    # Convert to DataFrame
    label_df = pd.DataFrame(labels)
    label_df["label"] = label_df["label"].map({"No": 0, "Yes": 1})  # Convert labels to binary
    label_df.set_index("id", inplace=True)
    
    return label_df

def load_data(encoding_file, labels_file):
    X = load_encoding(encoding_file)
    y = load_labels(labels_file)

    # Keep only labeled views
    X = X.loc[X.index.intersection(y.index)]
    y = y.loc[X.index]

    X.fillna(0, inplace=True)

    X_train, X_test, y_train, y_test = train_test_split(X, y.values.ravel(), test_size=0.2, random_state=RANDOM_SEED, stratify=y)

    return X_train, X_test, y_train, y_test

def tune_hyperparameters(X_train, y_train):
    param_grids = {
        "Logistic Regression": {
            "C": [0.01, 0.1, 1, 10, 100],
            "solver": ["liblinear", "lbfgs"],
        },
        "Support Vector Machine": {
            "C": [0.01, 0.1, 1, 10, 100],
            "kernel": ["linear", "rbf"]
        },
        "Random Forest": {
            "n_estimators": [50, 100, 200],
            "max_depth": [None, 10, 20, 30]
        },
        "K-Nearest Neighbors": {
            "n_neighbors": [3, 5, 7, 9],
            "weights": ["uniform", "distance"]
        }
    }
    
    best_models = {}
    for name, param_grid in param_grids.items():
        print(f"Tuning {name}...")
        model = {
            "Logistic Regression": LogisticRegression(random_state=RANDOM_SEED),
            "Support Vector Machine": SVC(random_state=RANDOM_SEED),
            "Random Forest": RandomForestClassifier(random_state=RANDOM_SEED),
            "K-Nearest Neighbors": KNeighborsClassifier()
        }[name]
        
        grid_search = GridSearchCV(model, param_grid, scoring="f1", cv=5, n_jobs=-1)
        grid_search.fit(X_train, y_train)
        best_models[name] = grid_search.best_estimator_
        print(f"Best parameters for {name}: {grid_search.best_params_}")
    
    return best_models

def train_and_evaluate(X_train, X_test, y_train, y_test, best_models, encoding_file):
    results = []
    for name, model in best_models.items():
        scoring = ["f1", "accuracy", "precision", "recall"]
        # calls model.fit() and model.predict() internally
        cv_results = cross_validate(model, X_train, y_train, cv=5, scoring=scoring, n_jobs=-1)

        cv_f1 = np.mean(cv_results["test_f1"])
        cv_accuracy = np.mean(cv_results["test_accuracy"])
        cv_precision = np.mean(cv_results["test_precision"])
        cv_recall = np.mean(cv_results["test_recall"])
        results.append((encoding_file, name, cv_f1, cv_accuracy, cv_precision, cv_recall))
    
    results_df = pd.DataFrame(results, columns=[
        "Encoding Config", "Model", "F1", "Accuracy", 
        "Precision", "Recall"
    ])
    print(results_df)
    results_df.to_csv(f".output/results/{Path(encoding_file).stem}_results.csv", index=False)
    return results_df


pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 1000)

all_results = []
for encoding_file in ENCODING_FILES:
    print("\nLoading data from:", encoding_file)
    X_train, X_test, y_train, y_test = load_data(encoding_file, LABELS_PATH)

    print("\nTuning Hyperparameters:")
    best_models = tune_hyperparameters(X_train, y_train)

    print("\nTraining and Evaluating Models:")
    results_df = train_and_evaluate(X_train, X_test, y_train, y_test, best_models, encoding_file)
    all_results.append(results_df)
    
final_results = pd.concat(all_results)
print("\nFinal Combined Results:")
print(final_results)
final_results.to_csv(".output/results/final_results.csv", index=False)