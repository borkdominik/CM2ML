#!/usr/bin/env python2

from dataclasses import dataclass
import datetime
from math import ceil
import os
import random
import sys
import time
from typing import Union
import numpy as np
from sklearn.metrics import classification_report
import torch

from torch import cuda
from torch.nn.utils import clip_grad_norm_

import paper.data_utils as data_utils
import paper.network as network
from utils import script_dir

MISSING_PREDICTION = "MISSING_PREDICTION"


@dataclass
class Args:
    # Parameters are initialized over uniform distribution in (-param_init, param_init)
    param_init: float
    num_epochs: int
    # early-stopping patience
    patience: int
    learning_rate: float
    # learning rate decays by this much
    learning_rate_decay_factor: float
    # decay the learning rate after certain steps
    learning_rate_decay_steps: int
    # minimum learning rate
    learning_rate_floor: float
    # clip gradients to this norm
    max_gradient_norm: float
    batch_size: int
    # size of each model layer
    hidden_size: int
    embedding_size: int
    dropout_rate: float
    # number of layers in the model
    num_layers: int
    train_dir_checkpoints: str
    # path to the pretrained tree2tree model
    load_model: Union[str, None]
    # set to true for testing
    test: bool
    # set to true to disable attention
    no_attention: bool
    # set to true to disable parent attention feeding
    no_pf: bool
    # set to true to prevent the network from training
    no_train: bool
    seed: int


def create_model(
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    args: Args,
) -> network.Tree2TreeModel:
    model = network.Tree2TreeModel(
        source_vocab,
        target_vocab,
        args.embedding_size,
        args.hidden_size,
        args.num_layers,
        args.max_gradient_norm,
        args.batch_size,
        args.learning_rate,
        args.dropout_rate,
        args.no_pf,
        args.no_attention,
    )

    if cuda.is_available():
        model.cuda()

    if args.load_model:
        print("Reading model parameters from %s" % args.load_model)
        pretrained_model = torch.load(args.load_model)
        model.load_state_dict(pretrained_model)
    else:
        print("Created model with fresh parameters.")
        model.init_weights(args.param_init)
    return model


def step_tree2tree(
    model: network.Tree2TreeModel,
    encoder_inputs: list[data_utils.BinaryTreeManager],
    init_decoder_inputs: list[data_utils.BinaryTreeManager],
    feed_previous: bool,
    args: Args,
):
    if feed_previous is False:
        model.dropout_rate = args.dropout_rate
    else:
        model.dropout_rate = 0.0

    predictions_per_batch, prediction_managers = model.forward(
        encoder_inputs,
        init_decoder_inputs,
        feed_previous=feed_previous,
    )

    total_loss = None
    for predictions, target in predictions_per_batch:
        loss = model.loss_function(predictions, target)
        if total_loss is None:
            total_loss = loss
        else:
            total_loss += loss

    total_loss /= len(encoder_inputs)

    if feed_previous:
        output_predictions = []

        for prediction_manager in prediction_managers:
            output_predictions.append(model.tree2seq(prediction_manager, 1))

    if feed_previous is False:
        model.optimizer.zero_grad()
        total_loss.backward()
        if args.max_gradient_norm > 0:
            clip_grad_norm_(model.parameters(), args.max_gradient_norm)
        model.optimizer.step()

    for idx in range(len(encoder_inputs)):
        encoder_inputs[idx].clear_states()

    if feed_previous:
        return total_loss.item(), output_predictions
    else:
        return total_loss.item()


def evaluate(
    model: network.Tree2TreeModel,
    test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    args: Args,
):
    test_loss = 0
    tot_trees = len(test_dataset)
    res = []
    predictions = []
    labels = []

    for idx in range(0, len(test_dataset), args.batch_size):
        encoder_inputs, decoder_inputs = model.get_batch(test_dataset, start_idx=idx)

        batch_loss, raw_outputs = step_tree2tree(
            model, encoder_inputs, decoder_inputs, feed_previous=True, args=args
        )

        test_loss += len(encoder_inputs) * batch_loss
        for i in range(len(encoder_inputs)):
            if idx + i >= len(test_dataset):
                break
            current_output = []

            for j in range(len(raw_outputs[i])):
                current_output.append(raw_outputs[i][j])

            (
                current_source,
                current_target,
                _current_source_manager,
                _current_target_manager,
            ) = test_dataset[idx + i]

            current_target_print = data_utils.serialize_tree_with_vocabulary(
                current_target, target_vocab
            )[1:]
            current_target = data_utils.serialize_tree(current_target)

            # _current_source_print = data_utils.serialize_tree_with_vocabulary(
            #     current_source, source_vocab
            # )
            current_source = data_utils.serialize_tree(current_source)

            # print("Evaluation time: %s seconds" % (datetime.datetime.now() - start_evaluation_datetime))
            # print((datetime.datetime.now() - start_evaluation_datetime))
            res.append((current_source, current_target, current_output))
            current_output_print = data_utils.serialize_seq_with_vocabulary(
                current_output, target_vocab
            )[1:]
            # print("--Current source / Current target / Current output--")
            # print(f"source {current_source_print}")
            # print(f"target {current_target_print}")
            # print(f"output {current_output_print}")
            # print("---")

            # remove first item from current_target, as it's the root note
            label = current_target_print
            labels.extend(label)
            # extends predictions with current_output, but ensure length matches to len(current_target)
            shortened_output = current_output_print[: len(label)]
            padded_output = shortened_output + [MISSING_PREDICTION] * (
                len(label) - len(shortened_output)
            )
            predictions.extend(padded_output)

    test_loss /= tot_trees
    print("  test: loss %.2f" % test_loss)
    report = classification_report(
        labels, predictions, output_dict=True, zero_division=np.nan
    )
    print(
        "  test: accuracy of classification %.2f" % (report["accuracy"] * 100)
    )
    return {
        "test": {
            "accuracy": report["accuracy"],
            "weighted avg": report["weighted avg"],
            "macro avg": report["macro avg"],
        }
    }


def train(
    training_dataset: data_utils.EncodedDataset,
    validation_dataset: data_utils.EncodedDataset,
    test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    args: Args,
):
    train_model = not args.no_train
    time_training = 0
    if train_model:
        print("Reading training and val data:")
        if not os.path.isdir(args.train_dir_checkpoints):
            os.makedirs(args.train_dir_checkpoints)

        start_time = time.time()
        start_datetime = datetime.datetime.now()

        print("Creating %d layers of %d units." % (args.num_layers, args.hidden_size))
        model = create_model(
            source_vocab,
            target_vocab,
            args,
        )

        print("Training model")
        epoch_time, epoch_loss = 0.0, 0.0
        current_step = 0
        previous_losses = []

        training_dataset_size = len(training_dataset)
        validation_dataset_size = len(validation_dataset)

        best_loss = float("inf")
        remaining_patience = args.patience

        for epoch in range(args.num_epochs):
            print("epoch: %s/%s" % (epoch + 1, args.num_epochs))
            batch = 0
            random.shuffle(training_dataset)
            number_of_batches = ceil(training_dataset_size / args.batch_size)
            for batch_idx in range(0, training_dataset_size, args.batch_size):
                batch += 1
                start_time = time.time()
                encoder_inputs, decoder_inputs = model.get_batch(
                    training_dataset, start_idx=batch_idx
                )

                batch_loss = step_tree2tree(
                    model,
                    encoder_inputs,
                    decoder_inputs,
                    feed_previous=False,
                    args=args,
                )

                epoch_time += time.time() - start_time
                epoch_loss += batch_loss * len(encoder_inputs)
                current_step += 1

                print("   batch: %d/%d" % (batch, number_of_batches))

                if (
                    current_step % args.learning_rate_decay_steps == 0
                    and model.learning_rate > args.learning_rate_floor
                ):
                    model.decay_learning_rate(args.learning_rate_decay_factor)

            epoch_loss /= training_dataset_size

            print(
                "learning rate %.4f epoch-time %.2f epoch-loss "
                "%.2f" % (model.learning_rate, epoch_time, epoch_loss)
            )
            previous_losses.append(epoch_loss)
            ckpt_path = os.path.join(
                args.train_dir_checkpoints,
                "translate_" + str(current_step) + ".ckpt",
            )
            ckpt = model.state_dict()
            torch.save(ckpt, ckpt_path)
            epoch_time, epoch_loss = 0.0, 0.0

            validation_loss = 0
            for batch_idx in range(0, validation_dataset_size, args.batch_size):
                encoder_inputs, decoder_inputs = model.get_batch(
                    validation_dataset, start_idx=batch_idx
                )

                validation_batch_loss, decoder_outputs = step_tree2tree(
                    model, encoder_inputs, decoder_inputs, feed_previous=True, args=args
                )
                validation_loss += validation_batch_loss * len(encoder_inputs)
            validation_loss /= validation_dataset_size
            print("  validation-loss %.2f" % validation_loss)
            if validation_loss < best_loss:
                best_loss = validation_loss
                remaining_patience = args.patience
            else:
                remaining_patience -= 1
                if remaining_patience < 0:
                    print(f"Early stopping in epoch {epoch + 1}")
                    break
            sys.stdout.flush()
        time_training = datetime.datetime.now() - start_datetime
        print("Saving model")
        torch.save(
            model.state_dict(), f"{script_dir}/../.cache/neuralnetwork-{args.seed}.pth"
        )
    else:  # not train_model
        print("Loading the pretrained model")
        model = create_model(
            source_vocab,
            target_vocab,
            args,
        )

    print("Evaluating model")
    start_evaluation_datetime = datetime.datetime.now()
    report = evaluate(
        model,
        test_dataset,
        source_vocab,
        target_vocab,
        args,
    )
    if train_model:
        print("Training time: %s seconds" % time_training)
    print(
        "Total Evaluation time: %s seconds"
        % (datetime.datetime.now() - start_evaluation_datetime)
    )
    return report


def test(
    test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    args: Args,
):
    model = create_model(source_vocab, target_vocab, args)
    return evaluate(
        model,
        test_dataset,
        source_vocab,
        target_vocab,
        args,
    )


def run(
    tokenized_training_dataset: data_utils.EncodedDataset,
    tokenized_validation_dataset: data_utils.EncodedDataset,
    tokenized_test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    seed: int,
):
    layer_size = len(source_vocab)
    batch_size = 32
    batches_per_epoch = ceil(len(tokenized_training_dataset) / batch_size)
    args = Args(
        **{
            "param_init": 0.1,
            "num_epochs": 30,
            "patience": 20,
            "learning_rate": 0.005,
            "learning_rate_decay_factor": 0.9,
            # multiple of number of batches per epoch, i.e., decay after nth epoch
            "learning_rate_decay_steps": batches_per_epoch * 3,
            "learning_rate_floor": 0.0001,
            "max_gradient_norm": 5.0,
            "batch_size": batch_size,
            "embedding_size": layer_size,
            "hidden_size": layer_size,
            "dropout_rate": 0.75,
            "num_layers": 1,
            "train_dir_checkpoints": f"{script_dir}/../.checkpoints/tree-lstm-{seed}.pt",
            "load_model": None,  # f"{script_dir}/../.cache/neuralnetwork-{seed}.pth",
            "test": False,
            "no_attention": False,
            "no_pf": False,
            "no_train": False,
            "seed": seed,
        }
    )
    if args.no_attention:
        args.no_pf = True
    if args.test:
        return test(tokenized_test_dataset, source_vocab, target_vocab, args)
    else:
        return train(
            tokenized_training_dataset,
            tokenized_validation_dataset,
            tokenized_test_dataset,
            source_vocab,
            target_vocab,
            args,
        )
