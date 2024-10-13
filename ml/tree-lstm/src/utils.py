import os
import time
import torch

text_padding = " " * 2


def pretty_duration(duration_seconds: int) -> str:
    return time.strftime("%H:%M:%S", time.gmtime(duration_seconds))


script_dir = os.path.dirname(os.path.realpath(__file__))

# Disable MPS due to limited implementation
use_mps = False and torch.backends.mps.is_available() and torch.backends.mps.is_built()
device = torch.device("mps" if use_mps else "cpu")


def merge_vocabularies(vocabularies: list[list[str]]) -> list[str]:
    total_vocabulary = []
    for vocabulary in vocabularies:
        for token in vocabulary:
            if token not in total_vocabulary:
                total_vocabulary.append(token)
    return total_vocabulary
