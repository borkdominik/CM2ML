#!/usr/bin/env python2

from dataclasses import dataclass
import datetime
import json
import os
import random
import sys
import time
from typing import Union
import torch

from torch import cuda
from torch.nn.utils import clip_grad_norm

import paper.data_utils as data_utils
import paper.network as network
from tree_dataset import TreeDataset
from utils import script_dir


def create_model(
    source_vocab_size,
    target_vocab_size,
    source_vocab,
    target_vocab,
    dropout_rate,
    max_source_len,
    max_target_len,
):
    model = network.Tree2TreeModel(
        source_vocab_size,
        target_vocab_size,
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


def step_tree2tree(model, encoder_inputs, init_decoder_inputs, feed_previous=False):
    if feed_previous is False:
        model.dropout_rate = args.dropout_rate
    else:
        model.dropout_rate = 0.0

    predictions_per_batch, prediction_managers = model(
        encoder_inputs, init_decoder_inputs, feed_previous=feed_previous
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
            clip_grad_norm(model.parameters(), args.max_gradient_norm)
        model.optimizer.step()

    for idx in range(len(encoder_inputs)):
        encoder_inputs[idx].clear_states()

    if feed_previous:
        return total_loss.data[0], output_predictions
    else:
        return total_loss.data[0]


def evaluate(model, test_set, source_vocab, target_vocab):
    test_loss = 0
    acc_tokens = 0
    tot_tokens = 0
    acc_programs = 0
    tot_programs = len(test_set)
    res = []

    for idx in range(0, len(test_set), args.batch_size):
        encoder_inputs, decoder_inputs = model.get_batch(test_set, start_idx=idx)

        eval_loss, raw_outputs = step_tree2tree(
            model, encoder_inputs, decoder_inputs, feed_previous=True
        )

        test_loss += len(encoder_inputs) * eval_loss
        for i in range(len(encoder_inputs)):
            if idx + i >= len(test_set):
                break
            current_output = []

            for j in range(len(raw_outputs[i])):
                current_output.append(raw_outputs[i][j])

            (
                current_source,
                current_target,
                current_source_manager,
                current_target_manager,
            ) = test_set[idx + i]

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
            print(current_source_print)
            print(current_target_print)
            print(current_output_print)
            # print(source_vocab)
            print("---")

            tot_tokens += len(current_target)
            all_correct = 1
            wrong_tokens = 0
            for j in range(len(current_output)):
                if j >= len(current_target):
                    break
                if current_output[j] == current_target[j]:
                    acc_tokens += 1
                else:
                    all_correct = 0
                    wrong_tokens += 1
            acc_programs += all_correct

    print(acc_tokens, tot_tokens, acc_programs, tot_programs)
    test_loss /= tot_programs
    print("  eval: loss %.2f" % test_loss)
    print("  eval: accuracy of tokens %.2f" % (acc_tokens * 1.0 / tot_tokens))
    print("  eval: accuracy of programs %.2f" % (acc_programs * 1.0 / tot_programs))
    print(acc_tokens, tot_tokens, acc_programs, tot_programs)


def train(
    training_dataset: TreeDataset,
    validation_dataset: TreeDataset,
    source_vocab,
    target_vocab,
    no_train,
):
    train_model = not no_train
    time_training = 0
    #    build_from_scratch = True;
    #    pretrained_model_path = "/home/lola/nn/neuralnetwork.pth";
    if train_model:
        print("Reading training and val data:")
        train_set = data_utils.prepare_data(
            training_dataset, source_vocab, target_vocab
        )
        val_set = data_utils.prepare_data(
            validation_dataset, source_vocab, target_vocab
        )

        if not os.path.isdir(args.train_dir_checkpoints):
            os.makedirs(args.train_dir_checkpoints)

        start_time = time.time()
        start_datetime = datetime.datetime.now()

        #      if (build_from_scratch):

        print("Creating %d layers of %d units." % (args.num_layers, args.hidden_size))
        model = create_model(
            len(source_vocab),
            len(target_vocab),
            source_vocab,
            target_vocab,
            args.dropout_rate,
            args.max_source_len,
            args.max_target_len,
        )
        #      else:
        #          print("Loading pretrained model")
        #          pretrained_model = torch.load(pretrained_model_path)
        #          model.load_state_dict(pretrained_model)

        print("Training model")
        step_time, loss = 0.0, 0.0
        current_step = 0
        previous_losses = []

        training_dataset_size = len(train_set)

        for epoch in range(args.num_epochs):
            print("epoch: %s/%s" % (epoch + 1, args.num_epochs))
            batch = 0
            random.shuffle(train_set)
            for batch_idx in range(0, training_dataset_size, args.batch_size):
                batch += 1
                start_time = time.time()
                encoder_inputs, decoder_inputs = model.get_batch(
                    train_set, start_idx=batch_idx
                )

                step_loss = step_tree2tree(
                    model, encoder_inputs, decoder_inputs, feed_previous=False
                )

                step_time += (time.time() - start_time) / args.steps_per_checkpoint
                loss += step_loss / args.steps_per_checkpoint
                current_step += 1

                print(
                    "   batch: %s/%s" % (batch, training_dataset_size / args.batch_size)
                )

                if (
                    current_step % args.learning_rate_decay_steps == 0
                    and model.learning_rate > 0.0001
                ):
                    model.decay_learning_rate(args.learning_rate_decay_factor)

                if current_step % args.steps_per_checkpoint == 0:
                    print(
                        "learning rate %.4f step-time %.2f loss "
                        "%.2f" % (model.learning_rate, step_time, loss)
                    )
                    previous_losses.append(loss)
                    ckpt_path = os.path.join(
                        args.train_dir_checkpoints,
                        "translate_" + str(current_step) + ".ckpt",
                    )
                    ckpt = model.state_dict()
                    torch.save(ckpt, ckpt_path)
                    step_time, loss = 0.0, 0.0

                    encoder_inputs, decoder_inputs = model.get_batch(
                        val_set, start_idx=0
                    )

                    eval_loss, decoder_outputs = step_tree2tree(
                        model, encoder_inputs, decoder_inputs, feed_previous=True
                    )
                    print("  eval: loss %.2f" % eval_loss)
                    sys.stdout.flush()
        time_training = datetime.datetime.now() - start_datetime
        print("Saving model")
        torch.save(model.state_dict(), "/home/lola/nn/neuralnetwork.pth")
    else:  # not train_model
        print("Loading the pretrained model")
        model = create_model(
            len(source_vocab),
            len(target_vocab),
            source_vocab,
            target_vocab,
            args.dropout_rate,
            args.max_source_len,
            args.max_target_len,
        )

    print("Evaluating model")
    start_evaluation_datetime = datetime.datetime.now()
    test_dataset = json.load(open(args.test_dataset, "r"))
    test_set = data_utils.prepare_data(test_dataset, source_vocab, target_vocab)
    evaluate(
        model,
        test_set,
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
    test_dataset, source_vocab, target_vocab
):
    model = create_model(
        len(source_vocab),
        len(target_vocab),
        source_vocab,
        target_vocab,
        0.0,
        args.max_source_len,
        args.max_target_len,
    )
    test_set = data_utils.prepare_data(test_dataset, source_vocab, target_vocab)
    evaluate(
        model,
        test_set,
        source_vocab,
        target_vocab,
    )


# parser = argparse.ArgumentParser()
# parser.add_argument(
#     "--param_init",
#     type=float,
#     default=0.1,
#     help="Parameters are initialized over uniform distribution in (-param_init, param_init)",
# )
# parser.add_argument(
#     "--num_epochs", type=int, default=30, help="number of training epochs"
# )  # default 30
# parser.add_argument(
#     "--learning_rate",
#     type=float,
#     default=0.005,  # default 0.005
#     help="learning rate",
# )
# parser.add_argument(
#     "--learning_rate_decay_factor",
#     type=float,
#     default=0.8,
#     help="learning rate decays by this much",
# )
# parser.add_argument(
#     "--learning_rate_decay_steps",
#     type=int,
#     default=2000,  # default=2000
#     help="decay the learning rate after certain steps",
# )
# parser.add_argument(
#     "--max_gradient_norm", type=float, default=5.0, help="clip gradients to this norm"
# )
# parser.add_argument(
#     "--batch_size",
#     type=int,
#     default=64,  # default 100
#     help="batch size",
# )
# parser.add_argument(
#     "--max_depth", type=int, default=100, help="max depth for tree models"
# )
# parser.add_argument(
#     "--hidden_size", type=int, default=256, help="size of each model layer"
# )
# parser.add_argument(
#     "--embedding_size", type=int, default=256, help="size of the embedding"
# )
# parser.add_argument(
#     "--dropout_rate",
#     type=float,
#     default=0.75,  # default=0.5
#     help="dropout rate",
# )
# parser.add_argument(
#     "--num_layers",
#     type=int,
#     default=1,  # default=1,
#     help="number of layers in the model",
# )
# parser.add_argument(
#     "--source_vocab_size",
#     type=int,
#     default=0,
#     help="source vocabulary size (0: no limit)",
# )
# parser.add_argument(
#     "--target_vocab_size",
#     type=int,
#     default=0,
#     help="target vocabulary size (0: no limit)",
# )
# parser.add_argument(
#     "--train_dir_checkpoints",
#     type=str,
#     default="/home/lola/nn/checkpoints",  # default='../model_ckpts/tree2tree/',
#     help="training directory - checkpoints",
# )
# parser.add_argument(
#     "--training_dataset",
#     type=str,
#     default="/home/lola/nn/models_train.json",  # default='../data/CS-JS/BL/preprocessed_progs_train.json',
#     help="training dataset path",
# )
# parser.add_argument(
#     "--validation_dataset",
#     type=str,
#     default="/home/lola/nn/models_valid.json",  # default='../data/CS-JS/BL/preprocessed_progs_valid.json',
#     help="validation dataset path",
# )
# parser.add_argument(
#     "--test_dataset",
#     type=str,
#     default="/home/lola/nn/models_test.json",  # default='../data/CS-JS/BL/preprocessed_progs_test.json',
#     help="test dataset path",
# )
# parser.add_argument(
#     "--load_model",
#     type=str,
#     default="/home/lola/nn/neuralnetwork.pth",  # default=None
#     help="path to the pretrained model",
# )
# parser.add_argument(
#     "--vocab_filename", type=str, default=None, help="filename for the vocabularies"
# )
# parser.add_argument(
#     "--steps_per_checkpoint",
#     type=int,
#     default=500,
#     help="number of training steps per checkpoint",
# )
# parser.add_argument(
#     "--max_source_len", type=int, default=115, help="max length for input"
# )
# parser.add_argument(
#     "--max_target_len", type=int, default=315, help="max length for output"
# )
# parser.add_argument("--test", action="store_true", help="set to true for testing")
# parser.add_argument(
#     "--no_attention", action="store_true", help="set to true to disable attention"
# )
# parser.add_argument(
#     "--no_pf",
#     action="store_true",
#     help="set to true to disable parent attention feeding",
# )
# parser.add_argument(
#     "--no_train",
#     help="set to true to prevent the network from training",
#     action="store_true",
# )
# args = parser.parse_args()
args = {
    "param_init": 0.1,
    "num_epochs": 1, # TODO/Jan: Increase epoch count
    "learning_rate": 0.005,
    "learning_rate_decay_factor": 0.8,
    "learning_rate_decay_steps": 2000,
    "max_gradient_norm": 5.0,
    "batch_size": 2, # 64,
    "max_depth": 100,
    "hidden_size": 256,
    "embedding_size": 256,
    "dropout_rate": 0,
    "num_layers": 1,
    "source_vocab_size": 0,
    "target_vocab_size": 0,
    "train_dir_checkpoints": f"{script_dir}/../.checkpoints/tree-lstm.pt",
    # "training_dataset": "/home/lola/nn/models_train.json",
    # "validation_dataset": "/home/lola/nn/models_valid.json",
    # "test_dataset": "/home/lola/nn/models_test.json",
    "load_model": None, # "/home/lola/nn/neuralnetwork.pth",
    "vocab_filename": None,
    "steps_per_checkpoint": 500,
    "max_source_len": 115,
    "max_target_len": 315,
    "test": False,
    "no_attention": False,
    "no_pf": False,
    "no_train": False,
}

@dataclass
class Args:
    param_init: float
    num_epochs: int
    learning_rate: float
    learning_rate_decay_factor: float
    learning_rate_decay_steps: int
    max_gradient_norm: float
    batch_size: int
    max_depth: int
    hidden_size: int
    embedding_size: int
    dropout_rate: float
    num_layers: int
    source_vocab_size: int
    target_vocab_size: int
    train_dir_checkpoints: str
    load_model: Union[str, None]
    vocab_filename: Union[str, None]
    steps_per_checkpoint: int
    max_source_len: int
    max_target_len: int
    test: bool
    no_attention: bool
    no_pf: bool
    no_train: bool

args = Args(**args)


def run(training_dataset: TreeDataset, validation_dataset: TreeDataset, test_dataset: TreeDataset, vocab):
    if args.no_attention:
        args.no_pf = True
    source_vocab = vocab
    target_vocab = vocab
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
            source_vocab,
            target_vocab,
            args.no_train,
        )
