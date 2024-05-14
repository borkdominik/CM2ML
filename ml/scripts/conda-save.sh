source scripts/conda-activate.sh && \
eval "$(conda shell.bash hook)" && \
conda env export | grep -v "^prefix: " > environment.yml
