#!/usr/bin/env python3
"""
Build an index for a word embeddings text file.

Input format (one entry per line):
  word 0.1 0.2 0.3 ...

Output (default: word_embeddings.idx):
  word<TAB>offset

Offsets are byte offsets from the start of the file.
"""

from __future__ import annotations

import argparse


def build_index(embeddings_path: str, index_path: str, encoding: str = "utf-8") -> None:
    # Read as bytes to make offsets exact and portable.
    with open(embeddings_path, "rb") as f_in, open(index_path, "w", encoding=encoding, newline="\n") as f_out:
        while True:
            offset = f_in.tell()
            line = f_in.readline()
            if not line:
                break

            # Skip empty/whitespace-only lines
            stripped = line.strip()
            if not stripped:
                continue

            # Word is the first token before whitespace
            # Decode only the needed part (cheap and safe)
            first_token = stripped.split(maxsplit=1)[0]
            try:
                word = first_token.decode(encoding)
            except UnicodeDecodeError:
                # If a word can't be decoded, skip that line rather than corrupting the index
                continue

            f_out.write(f"{word} {offset}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an index file for a word embeddings text file.")
    parser.add_argument("embeddings", help="Path to word_embeddings.txt")
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Path to index output file (default: <embeddings>.idx)",
    )
    parser.add_argument("--encoding", default="utf-8", help="Text encoding for words (default: utf-8)")
    args = parser.parse_args()

    out_path = args.output or (args.embeddings + ".idx")
    build_index(args.embeddings, out_path, encoding=args.encoding)


if __name__ == "__main__":
    main()
