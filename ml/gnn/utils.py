import os
import time


def pretty_duration(duration_seconds: int) -> str:
    return time.strftime("%H:%M:%S", time.gmtime(duration_seconds))


script_dir = os.path.dirname(os.path.realpath(__file__))
