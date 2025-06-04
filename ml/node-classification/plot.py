import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load the CSV file
df = pd.read_csv('/Users/philipp/projects/CM2ML/CM2ML/ml/report/C4/RandomForest_per_class_metrics.csv') 

# ArchiMate mapping
archimate_mapping = {
    0: "BusinessActor", 1: "BusinessRole", 2: "BusinessCollaboration", 3: "BusinessInterface",
    4: "BusinessProcess", 5: "BusinessFunction", 6: "BusinessInteraction", 7: "BusinessService",
    8: "BusinessEvent", 9: "BusinessObject", 10: "Contract", 11: "Representation",
    12: "Product", 13: "ApplicationComponent", 14: "ApplicationCollaboration", 15: "ApplicationInterface",
    16: "ApplicationProcess", 17: "ApplicationFunction", 18: "ApplicationInteraction", 19: "ApplicationService",
    20: "ApplicationEvent", 21: "DataObject", 22: "Node", 23: "Device", 24: "SystemSoftware",
    25: "TechnologyCollaboration", 26: "TechnologyInterface", 27: "TechnologyProcess", 28: "TechnologyFunction",
    29: "TechnologyInteraction", 30: "TechnologyService", 31: "TechnologyEvent", 32: "Artifact",
    33: "CommunicationNetwork", 34: "Path", 35: "Equipment", 36: "DistributionNetwork",
    37: "Facility", 38: "Material", 39: "Stakeholder", 40: "Driver", 41: "Assessment", 42: "Goal",
    43: "Outcome", 44: "Principle", 45: "Requirement", 46: "Constraint", 47: "Value", 48: "Meaning",
    49: "Resource", 50: "Capability", 51: "ValueStream", 52: "CourseOfAction", 53: "WorkPackage",
    54: "ImplementationEvent", 55: "Deliverable", 56: "Plateau", 57: "Gap", 58: "Location",
    59: "Grouping", 60: "Junction", 61: "OrJunction", 62: "AndJunction"
}

# Map numeric labels to ArchiMate class names
df['ClassName'] = df.iloc[:, 0].map(archimate_mapping)
class_labels = df['ClassName']

# Use only F1 and support
f1_metric = 'f1' if 'f1' in df.columns else df.columns[1]
support = df['support'] if 'support' in df.columns else None

x = np.arange(len(class_labels))
height = 0.35

# Use LaTeX-compatible style
plt.rcParams['font.family'] = 'serif'

fig, ax1 = plt.subplots(figsize=(12, 10))

# Plot F1 on bottom x-axis
bars = ax1.barh(x, df[f1_metric], height, label='F1 Score', color='steelblue')

ax1.set_ylabel('ArchiMate Element Type')
ax1.set_xlabel('F1 Score')
ax1.set_xlim(0, 1.05)
ax1.set_yticks(x)
ax1.set_yticklabels(class_labels, fontsize=8)
ax1.set_ylim(-0.5, len(class_labels) - 0.5)

# Plot support on top x-axis
if support is not None:
    ax2 = ax1.twiny()
    ax2.plot(support, x, 'o--', color='darkorange', label='Support')
    ax2.set_xlabel('Support (Count)')
    ax2.set_xlim(left=0)

# Combine legends and place outside the plot
lines, labels = ax1.get_legend_handles_labels()
if support is not None:
    lines2, labels2 = ax2.get_legend_handles_labels()
    lines += lines2
    labels += labels2
ax1.legend(lines, labels, loc='upper left', bbox_to_anchor=(1.02, 1), borderaxespad=0)

plt.tight_layout(rect=[0, 0, 0.85, 1])
plt.savefig('archimate_metrics_horizontal.pdf', bbox_inches='tight')
plt.show()