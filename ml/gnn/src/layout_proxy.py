from rich.layout import Layout
from rich.panel import Panel
from rich.text import Text


class LayoutProxy:
    def __init__(self, layout: Layout, title: str):
        self.layout = layout
        self.lines = []
        self.title = title

    def print(self, string: str):
        self.lines.append(string)
        new_text = "\n".join(self.lines)
        self.layout.update(Panel(Text(new_text), title=self.title))
        return self
