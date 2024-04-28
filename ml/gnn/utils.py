import os
import time
import torch


def pretty_duration(duration_seconds: int) -> str:
    return time.strftime("%H:%M:%S", time.gmtime(duration_seconds))

script_dir = os.path.dirname(os.path.realpath(__file__))

# Disable MPS due to limited implementation
use_mps = False and torch.backends.mps.is_available() and torch.backends.mps.is_built()
device = torch.device("mps" if use_mps else "cpu")
print(f"Using device: {device}")

