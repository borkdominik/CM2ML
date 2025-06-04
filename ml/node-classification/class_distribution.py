import re
import matplotlib.pyplot as plt
import matplotlib as mpl

file_path = "class-distribution.txt"

mpl.rcParams.update({
    "text.usetex": True,
    "font.family": "serif",
    "axes.titlesize": 16,
    "axes.labelsize": 14,
    "xtick.labelsize": 12,
    "ytick.labelsize": 12,
})

layer_colors = {
    'Business': '#ffffb5',
    'Application': '#b5ffff',
    'Technology': '#c9e7b7',
    'Physical': '#c9e7b7',
    'Motivation': '#ccccff',
    'Strategy': '#f5deaa',
    'Implementation': '#ffe0e0',
    'Other': '#ffffff'
}
layer_mapping = {
    'Business': [
        'BusinessActor', 'BusinessRole', 'BusinessCollaboration', 'BusinessInterface',
        'BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessService',
        'BusinessEvent', 'BusinessObject', 'Contract', 'Representation', 'Product'
    ],
    'Application': [
        'ApplicationComponent', 'ApplicationCollaboration', 'ApplicationInterface',
        'ApplicationProcess', 'ApplicationFunction', 'ApplicationInteraction',
        'ApplicationService', 'ApplicationEvent', 'DataObject'
    ],
    'Technology': [
        'Node', 'Device', 'SystemSoftware', 'TechnologyCollaboration', 'TechnologyInterface',
        'TechnologyProcess', 'TechnologyFunction', 'TechnologyInteraction', 'TechnologyService',
        'TechnologyEvent', 'Artifact', 'CommunicationNetwork', 'Path'
    ],
    'Physical': ['Equipment', 'DistributionNetwork', 'Facility', 'Material'],
    'Motivation': [
        'Stakeholder', 'Driver', 'Assessment', 'Goal', 'Outcome', 'Principle',
        'Requirement', 'Constraint', 'Value', 'Meaning'
    ],
    'Strategy': ['Resource', 'Capability', 'ValueStream', 'CourseOfAction'],
    'Implementation': ['WorkPackage', 'ImplementationEvent', 'Deliverable', 'Plateau', 'Gap'],
    'Other': ['Location', 'Grouping', 'Junction', 'OrJunction', 'AndJunction']
}

# Read and parse the file
classes = []
with open(file_path, 'r', encoding='utf-8') as file:
    for line in file:
        match = re.match(r'\s*Class\s+\d+\s+\((.+?)\):\s+(\d+)\s+\(([\d.]+)%\)', line)
        if match:
            name, count, percent = match.groups()
            classes.append((name, int(count), float(percent)))

# Sort by count descending
classes.sort(key=lambda x: x[1], reverse=True)

def get_layer_color(name):
    for layer, types in layer_mapping.items():
        if name in types:
            return layer_colors[layer]
    return layer_colors['Other']

# Extract components
names = [c[0] for c in classes]
counts = [c[1] for c in classes]
percents = [f"({c[2]:.2f}\\%)" for c in classes]
colors = [get_layer_color(name) for name in names]

# Plot
fig, ax = plt.subplots(figsize=(10, max(6, len(classes) * 0.25)))
bars = ax.barh(range(len(classes)), counts, align='center', color=colors, edgecolor='black', linewidth=0.5)
ax.set_yticks(range(len(classes)))
ax.set_yticklabels(names)
ax.set_xlabel("Number of Instances")
ax.set_ylabel("Class (ArchiMate Element Type)")

# Add percentage labels
for i, (bar, pct) in enumerate(zip(bars, percents)):
    ax.text(bar.get_width() + max(counts) * 0.005, bar.get_y() + bar.get_height() / 2,
            pct, va='center', fontsize=10)

# Remove top/bottom margin
ax.set_ylim(-0.6, len(classes) - 0.5)
ax.invert_yaxis()
ax.xaxis.grid(True, linestyle='--', alpha=0.3)
plt.subplots_adjust(right=1.3)

# Save as PDF
# plt.tight_layout()
plt.savefig("class_distribution.pdf", format="pdf", bbox_inches='tight')
plt.close()
