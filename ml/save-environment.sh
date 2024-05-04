eval "$(conda shell.bash hook)" && \
conda env export | grep -v "^prefix: " > ml/environment.yml
