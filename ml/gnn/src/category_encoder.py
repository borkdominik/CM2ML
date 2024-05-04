from typing import Optional, Set


class CategoryEncoder:
    def __init__(self):
        self.category_set: Set[Optional[str]] = set()

    def freeze(self):
        self.categories = list(self.category_set)

    def fit(self, category: Optional[str]):
        self.category_set.add(category)

    def transform(self, category: Optional[str]) -> int:
        if category is None:
            return 0
        return self.categories.index(category) + 1
