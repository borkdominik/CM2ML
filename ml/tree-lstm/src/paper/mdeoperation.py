#!/usr/bin/env python2

from dataclasses import dataclass
import datetime
from math import ceil
import os
import random
import sys
import time
from typing import Union
import torch

from torch import cuda
from torch.nn.utils import clip_grad_norm_

import paper.data_utils as data_utils
import paper.network as network
from tree_dataset import TreeDataset
from utils import script_dir


def create_model(
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    dropout_rate: float,
) -> network.Tree2TreeModel:
    model = network.Tree2TreeModel(
        source_vocab,
        target_vocab,
        args.max_depth,
        args.embedding_size,
        args.hidden_size,
        args.num_layers,
        args.max_gradient_norm,
        args.batch_size,
        args.learning_rate,
        dropout_rate,
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
    test_dataset: data_utils.EncodedDataset,  # TODO/Jan: Type!
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
):
    test_loss = 0
    acc_tokens = 0
    tot_tokens = 0
    acc_trees = 0
    tot_trees = len(test_dataset)
    res = []
    # model.eval()

    for idx in range(0, len(test_dataset), args.batch_size):
        encoder_inputs, decoder_inputs = model.get_batch(test_dataset, start_idx=idx)

        eval_loss, raw_outputs = step_tree2tree(
            model, encoder_inputs, decoder_inputs, feed_previous=True
        )

        test_loss += len(encoder_inputs) * eval_loss
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
            )
            current_target = data_utils.serialize_tree(current_target)

            current_source_print = data_utils.serialize_tree_with_vocabulary(
                current_source, source_vocab
            )
            current_source = data_utils.serialize_tree(current_source)

            # print("Evaluation time: %s seconds" % (datetime.datetime.now() - start_evaluation_datetime))
            # print((datetime.datetime.now() - start_evaluation_datetime))
            res.append((current_source, current_target, current_output))
            current_output_print = data_utils.serialize_seq_with_vocabulary(
                current_output, target_vocab
            )
            # print("--Current source / Current target / Current output--")
            # print(f"source {current_source_print}")
            print(f"target {current_target_print}")
            print(f"output {current_output_print}")
            print("---")

            tot_tokens += len(current_target)
            all_correct = len(current_target) == len(current_output)
            wrong_tokens = 0
            for j in range(len(current_output)):
                if j >= len(current_target):
                    break
                if current_output[j] == current_target[j]:
                    acc_tokens += 1
                else:
                    all_correct = 0
                    wrong_tokens += 1
            acc_trees += all_correct

    print(acc_tokens, tot_tokens, acc_trees, tot_trees)
    test_loss /= tot_trees
    print("  eval: loss %.2f" % test_loss)
    if tot_tokens != 0:
        print("  eval: accuracy of tokens %.2f" % (acc_tokens * 1.0 / tot_tokens))
    print("  eval: accuracy of programs %.2f" % (acc_trees * 1.0 / tot_trees))
    print(acc_tokens, tot_tokens, acc_trees, tot_trees)


def train(
    training_dataset: data_utils.EncodedDataset,
    validation_dataset: data_utils.EncodedDataset,
    test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
    no_train: bool,
):
    train_model = not no_train
    time_training = 0
    #    build_from_scratch = True;
    #    pretrained_model_path = "/home/lola/nn/neuralnetwork.pth";
    if train_model:
        print("Reading training and val data:")
        if not os.path.isdir(args.train_dir_checkpoints):
            os.makedirs(args.train_dir_checkpoints)

        start_time = time.time()
        start_datetime = datetime.datetime.now()

        #      if (build_from_scratch):

        print("Creating %d layers of %d units." % (args.num_layers, args.hidden_size))
        model = create_model(
            source_vocab,
            target_vocab,
            args.dropout_rate,
        )
        # model.train()
        #      else:
        #          print("Loading pretrained model")
        #          pretrained_model = torch.load(pretrained_model_path)
        #          model.load_state_dict(pretrained_model)

        print("Training model")
        epoch_time, loss = 0.0, 0.0
        current_step = 0
        previous_losses = []

        training_dataset_size = len(training_dataset)

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
                    model, encoder_inputs, decoder_inputs, feed_previous=False
                )

                epoch_time += (time.time() - start_time)
                loss += batch_loss
                current_step += 1

                print("   batch: %d/%d" % (batch, number_of_batches))

                if (
                    current_step % args.learning_rate_decay_steps == 0
                    and model.learning_rate > 0.0001
                ):
                    model.decay_learning_rate(args.learning_rate_decay_factor)

            loss /= number_of_batches

            print(
                "learning rate %.4f epoch-time %.2f loss "
                "%.2f" % (model.learning_rate, epoch_time, loss)
            )
            previous_losses.append(loss)
            ckpt_path = os.path.join(
                args.train_dir_checkpoints,
                "translate_" + str(current_step) + ".ckpt",
            )
            ckpt = model.state_dict()
            torch.save(ckpt, ckpt_path)
            epoch_time, loss = 0.0, 0.0

            encoder_inputs, decoder_inputs = model.get_batch(
                validation_dataset, start_idx=0
            )

            eval_loss, decoder_outputs = step_tree2tree(
                model, encoder_inputs, decoder_inputs, feed_previous=True
            )
            print("  eval: loss %.2f" % eval_loss)
            if eval_loss < best_loss:
                best_loss = eval_loss
                remaining_patience = args.patience
            else:
                remaining_patience -= 1
                if remaining_patience == 0:
                    print(
                        f"Early stopping in epoch {epoch}"
                    )
                    break
            sys.stdout.flush()
        time_training = datetime.datetime.now() - start_datetime
        print("Saving model")
        torch.save(model.state_dict(), f"{script_dir}/../.cache/neuralnetwork.pth")
    else:  # not train_model
        print("Loading the pretrained model")
        model = create_model(
            source_vocab,
            target_vocab,
            args.dropout_rate,
        )

    print("Evaluating model")
    start_evaluation_datetime = datetime.datetime.now()
    evaluate(
        model,
        test_dataset,
        source_vocab,
        target_vocab,
    )
    if train_model:
        print("Training time: %s seconds" % time_training)
    print(
        "Total Evaluation time: %s seconds"
        % (datetime.datetime.now() - start_evaluation_datetime)
    )


def test(
    test_dataset: data_utils.EncodedDataset,
    source_vocab: data_utils.Vocab,
    target_vocab: data_utils.Vocab,
):
    model = create_model(
        source_vocab,
        target_vocab,
        0.0,
    )
    evaluate(
        model,
        test_dataset,
        source_vocab,
        target_vocab,
    )


@dataclass
class Args:
    # Parameters are initialized over uniform distribution in (-param_init, param_init)
    param_init: float
    num_epochs: int
    learning_rate: float
    # learning rate decays by this much
    learning_rate_decay_factor: float
    # decay the learning rate after certain steps
    learning_rate_decay_steps: int
    # clip gradients to this norm
    max_gradient_norm: float
    batch_size: int
    # max depth for tree models
    max_depth: int
    # size of each model layer
    hidden_size: int
    embedding_size: int
    dropout_rate: float
    # number of layers in the model
    num_layers: int
    train_dir_checkpoints: str
    # path to the pretrained tree2tree model
    load_model: Union[str, None]
    # max length for input
    max_source_len: int
    # max length for output
    max_target_len: int
    # set to true for testing
    test: bool
    # set to true to disable attention
    no_attention: bool
    # set to true to disable parent attention feeding
    no_pf: bool
    # set to true to prevent the network from training
    no_train: bool
    # early-stopping patience
    patience: int


args = Args(
    **{
        "param_init": 0.1,
        "num_epochs": 50,
        "learning_rate": 0.005,
        "learning_rate_decay_factor": 0.8,
        "learning_rate_decay_steps": 2000,
        "max_gradient_norm": 5.0,
        "batch_size": 32,
        "max_depth": 100,
        "hidden_size": 256,
        "embedding_size": 256,
        "dropout_rate": 0.5,
        "num_layers": 2,
        "train_dir_checkpoints": f"{script_dir}/../.checkpoints/tree-lstm.pt",
        "load_model": None,  # f"{script_dir}/../.cache/neuralnetwork.pth",
        "max_source_len": 115,
        "max_target_len": 315,
        "test": False,
        "no_attention": False,
        "no_pf": False,
        "no_train": False,
        "patience": 5,
    }
)


def run(
    training_dataset: TreeDataset,
    validation_dataset: TreeDataset,
    test_dataset: TreeDataset,
    vocab: list[str],
):
    if args.no_attention:
        args.no_pf = True
    now = datetime.datetime.now()
    source_vocab, target_vocab = data_utils.build_vocab(
        [training_dataset, validation_dataset, test_dataset]
    )

    print(f"Vocabulary built in {datetime.datetime.now() - now}")
    print(f"Source vocabulary size: {len(source_vocab)}")
    print(f"Target vocabulary size: {len(target_vocab)}")
    now = datetime.datetime.now()
    training_dataset = data_utils.prepare_data(
        training_dataset, source_vocab, target_vocab
    )
    validation_dataset = data_utils.prepare_data(
        validation_dataset, source_vocab, target_vocab
    )
    test_dataset = data_utils.prepare_data(test_dataset, source_vocab, target_vocab)
    print(f"Data prepared in {datetime.datetime.now() - now}")
    if args.test:
        test(
            test_dataset,
            source_vocab,
            target_vocab,
        )
    else:
        train(
            training_dataset,
            validation_dataset,
            test_dataset,
            source_vocab,
            target_vocab,
            args.no_train,
        )
