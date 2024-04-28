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

checkpoint_dir = f"{script_dir}/checkpoints"

def save(filename: str, model, optimizer):
    torch.save(
        {
            "optimizer": optimizer.state_dict(),
            "model": model.state_dict(),
        },
        f"{checkpoint_dir}/{filename}",
    )


def resume(filename: str, model, optimizer):
    checkpoint = torch.load(
        f"{checkpoint_dir}/{filename}",
    )
    model.load_state_dict(checkpoint["model"])
    optimizer.load_state_dict(checkpoint["optimizer"])
