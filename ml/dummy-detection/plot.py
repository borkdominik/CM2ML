import pandas as pd
import matplotlib.pyplot as plt

# Load CSV
file_path = "final_results.csv"  # adjust if needed
df = pd.read_csv(file_path)

# Extract group and ID using correct regex
df["Group"] = df["Encoding Config"].str.extract(r'(C_n(?:tr|t|)?)_')
df["ID"] = df["Encoding Config"].str.extract(r'_(\d+)$')
df = df.dropna(subset=["Group", "ID"])
df["ID"] = df["ID"].astype(int)

# Plot setup
models = df["Model"].unique()
groups = sorted(df["Group"].unique())

linestyles = {"C_n": "-", "C_nt": "--", "C_ntr": ":"}
markers = {"C_n": "o", "C_nt": "s", "C_ntr": "D"}
colors = {"C_n": "#0072B2", "C_nt": "#E69F00", "C_ntr": "#D55E00"}

fig, axes = plt.subplots(2, 2, figsize=(16, 10), sharex=True, sharey=True)
axes = axes.flatten()

for ax, model in zip(axes, models):
    model_df = df[df["Model"] == model]
    pivot_df = model_df.pivot_table(index="ID", columns="Group", values="F1")

    for group in groups:
        if group in pivot_df.columns:
            ax.plot(
                pivot_df.index,
                pivot_df[group],
                label=group,
                linestyle=linestyles.get(group, "-"),
                marker=markers.get(group, "o"),
                linewidth=2.5,
                color=colors.get(group)
            )

    ax.set_title(model)
    ax.set_xlabel("Parameter Variant (ID)")
    ax.set_ylabel("F1 Score")
    ax.set_xticks(range(1, 17))
    ax.set_xticklabels([str(i) for i in range(1, 17)])
    ax.grid(True)

handles, labels = ax.get_legend_handles_labels()
fig.legend(handles, labels, loc='upper center', ncol=3, title="Group")
fig.tight_layout(rect=[0, 0, 1, 0.95])
#fig.suptitle("F1 Score Trends by ML Model", fontsize=16)
fig.savefig("F1_score_trends_combined.pdf")
plt.close()