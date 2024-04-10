# @cm2ml/plugin

## Data propagation

Plugins propagate data via two mechanisms as described below.

### Feed-forward mechanism - Input - Output

The first and more important mechanism is the `input` parameter and the return value of the `invoke` method.
These form a "feed-forward" mechanism, where the plugin receives data from the previous plugin and returns data to the next plugin.

### Pull-forward mechanism - Batch Metadata

In contrast to this approach, there is batch metadata.
Batch metadata is created by a plugin via the optional `batchMetadataCollector` method.
This methods receives the entire batch of input data (if the execution is non-batched, the batch will contain only one element, i.e, the plugins own input) as well as (possibly `undefined`) batch metadata of the previous plugin and returns the new batch metadata that is received by the same plugin's `invoke` method.

This is also referred to as a "pull-forward" mechanism, as the `batchMetadataCollector` is able to pull batch metadata from the previous plugin if required.

The use case for the batch metadata are plugins that need information about the entire batch.
Examples include feature vector creation, where the plugin needs to know the number of features in the entire batch to create a consistent feature vector.

> Note: The `batchMetadataCollector` is only executed once per batch, right before the `invoke` method is called for every item of the batch.
> As such, it is suitable for calculating batch-wide metadata, but not for per-item calculations.
