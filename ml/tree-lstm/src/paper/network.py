import torch
import torch.nn as nn
import torch.optim as optim
from torch import cuda
from torch.nn.utils import clip_grad_norm_
import torch.nn.functional as F
from paper.binary_tree import BinaryTreeManager

import paper.data_utils as data_utils


def repackage_state(h):
    """Detach hidden states from their history."""
    if isinstance(h, torch.Tensor):
        return h.detach()
    else:
        return tuple(repackage_state(v) for v in h)


class TreeEncoder(nn.Module):
    def __init__(self, source_vocab_size, embedding_size, hidden_size, batch_size):
        super(TreeEncoder, self).__init__()
        self.source_vocab_size = source_vocab_size
        self.embedding_size = embedding_size
        self.hidden_size = hidden_size
        self.batch_size = batch_size
        self.cuda_flag = cuda.is_available()

        self.encoder_embedding = nn.Embedding(
            self.source_vocab_size, self.embedding_size
        )

        self.ix = nn.Linear(self.hidden_size, self.embedding_size, bias=True)
        self.ilh = nn.Linear(self.hidden_size, self.hidden_size)
        self.irh = nn.Linear(self.hidden_size, self.hidden_size)

        self.fx = nn.Linear(self.hidden_size, self.embedding_size, bias=True)
        self.flh = nn.Linear(self.hidden_size, self.hidden_size)
        self.frh = nn.Linear(self.hidden_size, self.hidden_size)

        self.ox = nn.Linear(self.hidden_size, self.embedding_size, bias=True)
        self.olh = nn.Linear(self.hidden_size, self.hidden_size)
        self.orh = nn.Linear(self.hidden_size, self.hidden_size)

        self.ux = nn.Linear(self.hidden_size, self.embedding_size, bias=True)
        self.ulh = nn.Linear(self.hidden_size, self.hidden_size)
        self.urh = nn.Linear(self.hidden_size, self.hidden_size)

    def calc_root(self, inputs, child_h, child_c):
        i = F.sigmoid(
            self.ix(inputs) + self.ilh(child_h[:, 0]) + self.irh(child_h[:, 1])
        )
        o = F.sigmoid(
            self.ox(inputs) + self.olh(child_h[:, 0]) + self.orh(child_h[:, 1])
        )
        u = F.tanh(self.ux(inputs) + self.ulh(child_h[:, 0]) + self.urh(child_h[:, 1]))

        fx = self.fx(inputs)
        fx = torch.stack([fx, fx], dim=1)
        fl = self.flh(child_h[:, 0])
        fr = self.frh(child_h[:, 1])
        f = torch.stack([fl, fr], dim=1)
        f = f + fx
        f = F.sigmoid(f)
        fc = F.torch.mul(f, child_c)
        c = F.torch.mul(i, u) + F.torch.sum(fc, 1)
        h = F.torch.mul(o, F.tanh(c))
        return h, c

    def encode(self, encoder_inputs, children_h, children_c):
        embedding = self.encoder_embedding(encoder_inputs)
        embedding = embedding.squeeze()
        if len(embedding.size()) == 1:
            embedding = embedding.unsqueeze(0)
        encoder_outputs = self.calc_root(embedding, children_h, children_c)
        return encoder_outputs

    def forward(self, encoder_managers: list[BinaryTreeManager]):
        queue = []
        head = 0
        max_num_nodes = 0
        visited_idx: list[int] = []

        for encoder_manager_idx in range(len(encoder_managers)):
            encoder_manager = encoder_managers[encoder_manager_idx]
            max_num_nodes = max(max_num_nodes, encoder_manager.num_nodes)
            idx = encoder_manager.num_nodes - 1
            while idx >= 0:
                current_tree = encoder_manager.get_node(idx)
                canVisited = True
                if current_tree.lchild is not None:
                    ltree = encoder_manager.get_node(current_tree.lchild)
                    if ltree.state is None:
                        canVisited = False
                if current_tree.rchild is not None:
                    rtree = encoder_manager.get_node(current_tree.rchild)
                    if rtree.state is None:
                        canVisited = False
                if canVisited:
                    tree_node_value = current_tree.value
                    if current_tree.lchild is None:
                        children_c = torch.zeros(self.hidden_size)
                        children_h = torch.zeros(self.hidden_size)
                        if self.cuda_flag:
                            children_c = children_c.cuda()
                            children_h = children_h.cuda()
                    else:
                        children_h, children_c = ltree.state
                        children_h = children_h
                        children_c = children_c
                    if current_tree.rchild is None:
                        rchild_c = torch.zeros(self.hidden_size)
                        rchild_h = torch.zeros(self.hidden_size)
                        if self.cuda_flag:
                            rchild_c = rchild_c.cuda()
                            rchild_h = rchild_h.cuda()
                        children_c = torch.stack([children_c, rchild_c], dim=0)
                        children_h = torch.stack([children_h, rchild_h], dim=0)
                    else:
                        rchild_h, rchild_c = rtree.state
                        rchild_h = rchild_h
                        rchild_c = rchild_c
                        children_c = torch.stack([children_c, rchild_c], dim=0)
                        children_h = torch.stack([children_h, rchild_h], dim=0)
                    queue.append(
                        (
                            encoder_manager_idx,
                            idx,
                            tree_node_value,
                            children_h,
                            children_c,
                        )
                    )
                else:
                    break
                idx -= 1
            visited_idx.append(idx)

        while head < len(queue):
            encoder_inputs = []
            children_h = []
            children_c = []
            tree_idxes: list[tuple[int, int]] = []
            while head < len(queue):
                encoder_manager_idx, idx, tree_node_value, child_h, child_c = queue[
                    head
                ]
                current_tree = encoder_managers[encoder_manager_idx].get_node(idx)
                tree_idxes.append((encoder_manager_idx, idx))
                encoder_inputs.append(tree_node_value)
                children_h.append(child_h)
                children_c.append(child_c)
                head += 1
            encoder_inputs = torch.stack(encoder_inputs, dim=0)
            children_h = torch.stack(children_h, dim=0)
            children_c = torch.stack(children_c, dim=0)
            if self.cuda_flag:
                encoder_inputs = encoder_inputs.cuda()
            encoder_outputs = self.encode(encoder_inputs, children_h, children_c)
            for i in range(len(tree_idxes)):
                current_encoder_manager_idx, current_idx = tree_idxes[i]
                child_h = encoder_outputs[0][i]
                child_c = encoder_outputs[1][i]
                encoder_managers[current_encoder_manager_idx].get_node(
                    current_idx
                ).state = child_h, child_c

                current_tree = encoder_managers[current_encoder_manager_idx].get_node(
                    current_idx
                )

                if current_tree.parent == visited_idx[current_encoder_manager_idx]:
                    encoder_manager_idx = current_encoder_manager_idx
                    encoder_manager = encoder_managers[encoder_manager_idx]
                    idx = visited_idx[encoder_manager_idx]

                    while idx >= 0:
                        current_tree = encoder_manager.get_node(idx)
                        canVisited = True
                        if current_tree.lchild is not None:
                            ltree = encoder_manager.get_node(current_tree.lchild)
                            if ltree.state is None:
                                canVisited = False
                        if current_tree.rchild is not None:
                            rtree = encoder_manager.get_node(current_tree.rchild)
                            if rtree.state is None:
                                canVisited = False

                        if canVisited:
                            tree_node_value = current_tree.value
                            if current_tree.lchild is None:
                                children_c = torch.zeros(self.hidden_size)
                                children_h = torch.zeros(self.hidden_size)
                                if self.cuda_flag:
                                    children_c = children_c.cuda()
                                    children_h = children_h.cuda()
                            else:
                                children_h, children_c = ltree.state
                                children_h = children_h
                                children_c = children_c

                            if current_tree.rchild is None:
                                rchild_c = torch.zeros(self.hidden_size)
                                rchild_h = torch.zeros(self.hidden_size)
                                if self.cuda_flag:
                                    rchild_c = rchild_c.cuda()
                                    rchild_h = rchild_h.cuda()
                            else:
                                rchild_h, rchild_c = rtree.state
                                rchild_h = rchild_h
                                rchild_c = rchild_c

                            children_c = torch.stack([children_c, rchild_c], dim=0)
                            children_h = torch.stack([children_h, rchild_h], dim=0)
                            queue.append(
                                (
                                    encoder_manager_idx,
                                    idx,
                                    tree_node_value,
                                    children_h,
                                    children_c,
                                )
                            )
                        else:
                            break
                        idx -= 1
                    visited_idx[encoder_manager_idx] = idx

        PAD_state_token = torch.zeros(self.hidden_size)
        if self.cuda_flag:
            PAD_state_token = PAD_state_token.cuda()

        encoder_h_state = []
        encoder_c_state = []
        init_encoder_outputs = []
        init_attention_masks = []
        for encoder_manager in encoder_managers:
            tree_node_value = encoder_manager.get_node(0)
            h, c = tree_node_value.state
            encoder_h_state.append(h)
            encoder_c_state.append(c)
            init_encoder_output = []
            for node in encoder_manager.nodes:
                init_encoder_output.append(node.state[0])
            attention_mask = [0] * len(init_encoder_output)
            current_len = len(init_encoder_output)
            if current_len < max_num_nodes:
                init_encoder_output = init_encoder_output + [PAD_state_token] * (
                    max_num_nodes - current_len
                )
                attention_mask = attention_mask + [1] * (max_num_nodes - current_len)
            attention_mask = torch.ByteTensor(attention_mask)
            if self.cuda_flag:
                attention_mask = attention_mask.cuda()
            init_attention_masks.append(attention_mask)
            init_encoder_output = torch.stack(init_encoder_output, dim=0)
            init_encoder_outputs.append(init_encoder_output)

        init_encoder_outputs = torch.stack(init_encoder_outputs, dim=0)
        init_attention_masks = torch.stack(init_attention_masks, dim=0)

        return (
            init_encoder_outputs,
            init_attention_masks,
            encoder_h_state,
            encoder_c_state,
        )


class Tree2TreeModel(nn.Module):
    def __init__(
        self,
        source_vocab: data_utils.Vocab,
        target_vocab: data_utils.Vocab,
        max_depth: int,
        embedding_size: int,
        hidden_size: int,
        num_layers: int,
        max_gradient_norm: float,
        batch_size: int,
        learning_rate: float,
        dropout_rate: float,
        no_pf: bool,
        no_attention: bool,
    ):
        super(Tree2TreeModel, self).__init__()
        self.source_vocab_size = len(source_vocab)
        self.target_vocab_size = len(target_vocab)
        self.source_vocab = source_vocab
        self.target_vocab = target_vocab
        self.max_depth = max_depth
        self.embedding_size = embedding_size
        self.hidden_size = hidden_size
        self.batch_size = batch_size
        self.num_layers = num_layers
        self.max_gradient_norm = max_gradient_norm
        self.learning_rate = learning_rate
        self.dropout_rate = dropout_rate
        self.no_pf = no_pf
        self.no_attention = no_attention
        self.cuda_flag = cuda.is_available()

        if self.dropout_rate > 0:
            self.dropout = nn.Dropout(p=self.dropout_rate)

        self.encoder = TreeEncoder(
            self.source_vocab_size,
            self.embedding_size,
            self.hidden_size,
            self.batch_size,
        )

        self.decoder_embedding = nn.Embedding(
            self.target_vocab_size, self.embedding_size
        )

        if self.no_pf:
            self.decoder_l = nn.LSTM(
                input_size=self.embedding_size,
                hidden_size=self.hidden_size,
                num_layers=self.num_layers,
                batch_first=True,
                dropout=self.dropout_rate,
            )
            self.decoder_r = nn.LSTM(
                input_size=self.embedding_size,
                hidden_size=self.hidden_size,
                num_layers=self.num_layers,
                batch_first=True,
                dropout=self.dropout_rate,
            )
        else:
            self.decoder_l = nn.LSTM(
                input_size=self.embedding_size + self.hidden_size,
                hidden_size=self.hidden_size,
                num_layers=self.num_layers,
                batch_first=True,
                dropout=self.dropout_rate,
            )
            self.decoder_r = nn.LSTM(
                input_size=self.embedding_size + self.hidden_size,
                hidden_size=self.hidden_size,
                num_layers=self.num_layers,
                batch_first=True,
                dropout=self.dropout_rate,
            )

        self.attention_linear = nn.Linear(
            self.hidden_size * 2, self.hidden_size, bias=True
        )
        self.attention_tanh = nn.Tanh()

        self.output_linear_layer = nn.Linear(
            self.hidden_size, self.target_vocab_size, bias=True
        )

        self.loss_function = nn.CrossEntropyLoss(reduction="sum")
        self.optimizer = optim.Adam(self.parameters(), lr=self.learning_rate)

    def init_weights(self, param_init):
        for param in self.parameters():
            param.data.uniform_(-param_init, param_init)

    def decay_learning_rate(self, learning_rate_decay_factor):
        self.learning_rate *= learning_rate_decay_factor
        self.optimizer = optim.Adam(self.parameters(), lr=self.learning_rate)

    def train(self):
        if self.max_gradient_norm > 0:
            clip_grad_norm_(self.parameters(), self.max_gradient_norm)
        self.optimizer.step()

    def attention(self, encoder_outputs, attention_masks, decoder_output):
        dotted = torch.bmm(encoder_outputs, decoder_output.unsqueeze(2))
        dotted = dotted.squeeze()
        if len(dotted.size()) == 1:
            dotted = dotted.unsqueeze(0)
        dotted.data.masked_fill_(attention_masks.data.bool(), -float("inf"))
        attention = nn.Softmax(dim=1)(dotted)
        encoder_attention = torch.bmm(
            torch.transpose(encoder_outputs, 1, 2), attention.unsqueeze(2)
        )
        encoder_attention = encoder_attention.squeeze()
        if len(encoder_attention.size()) == 1:
            encoder_attention = encoder_attention.unsqueeze(0)
        res = self.attention_tanh(
            self.attention_linear(torch.cat([decoder_output, encoder_attention], 1))
        )
        return res

    def tree2seq(self, prediction_manager: BinaryTreeManager, current_idx: int):
        current_node = prediction_manager.get_node(current_idx)
        if current_node.prediction == data_utils.EOS_ID:
            return []
        prediction = [data_utils.LEFT_BRACKET_ID]
        prediction.append(current_node.prediction)
        if current_node.lchild is not None:
            prediction = prediction + self.tree2seq(
                prediction_manager, current_node.lchild
            )
        prediction.append(data_utils.RIGHT_BRACKET_ID)
        if current_node.rchild is not None:
            prediction = prediction + self.tree2seq(
                prediction_manager, current_node.rchild
            )
        return prediction

    def predict(self, decoder_output, encoder_outputs, attention_masks):  # TODO/Jan: Type!
        if self.no_attention:
            output = decoder_output
            attention_output = decoder_output
        else:
            attention_output = self.attention(
                encoder_outputs, attention_masks, decoder_output
            )
            if self.dropout_rate > 0:
                output = self.dropout(attention_output)
            else:
                output = attention_output
        output_linear = self.output_linear_layer(output)
        return output_linear, attention_output

    def decode(
        self,
        encoder_outputs: torch.Tensor,
        attention_masks: torch.Tensor,
        init_state: tuple[list[torch.Tensor], list[torch.Tensor]],
        init_decoder_inputs: torch.Tensor,
        attention_inputs: list[torch.Tensor],
    ):
        embedding = self.decoder_embedding(init_decoder_inputs)
        state_l = repackage_state(init_state)
        state_r = repackage_state(init_state)
        if self.no_pf:
            decoder_inputs = embedding
        else:
            decoder_inputs = torch.cat([embedding, attention_inputs], 2)
        output_l, state_l = self.decoder_l(decoder_inputs, state_l)
        output_r, state_r = self.decoder_r(decoder_inputs, state_r)
        output_l = output_l.squeeze()
        if len(output_l.size()) == 1:
            output_l = output_l.unsqueeze(0)
        output_r = output_r.squeeze()
        if len(output_r.size()) == 1:
            output_r = output_r.unsqueeze(0)
        prediction_l, attention_output_l = self.predict(
            output_l, encoder_outputs, attention_masks
        )
        prediction_r, attention_output_r = self.predict(
            output_r, encoder_outputs, attention_masks
        )
        return (
            prediction_l,  # TODO/Jan: Type!
            prediction_r,  # TODO/Jan: Type!
            state_l,  # TODO/Jan: Type!
            state_r,  # TODO/Jan: Type!
            attention_output_l,  # TODO/Jan: Type!
            attention_output_r,  # TODO/Jan: Type!
        )

    def forward(
        self,
        encoder_managers: list[BinaryTreeManager],
        decoder_managers: list[BinaryTreeManager],
        feed_previous=False,
    ):
        init_encoder_outputs, init_attention_masks, encoder_h_state, encoder_c_state = (
            self.encoder.forward(encoder_managers)
        )

        queue: list[tuple[int, int]] = []

        prediction_managers: list[BinaryTreeManager] = []
        for idx in range(len(decoder_managers)):
            prediction_managers.append(BinaryTreeManager())

        for idx in range(len(decoder_managers)):
            # current_target_manager_idx = idx
            # current_target_idx = 0
            current_prediction_idx = prediction_managers[idx].create_node(
                data_utils.GO_ID, None, 0
            )
            prediction_managers[idx].get_node(current_prediction_idx).state = (
                encoder_h_state[idx].unsqueeze(0),
                encoder_c_state[idx].unsqueeze(0),
            )
            prediction_managers[idx].get_node(current_prediction_idx).target = 0
            queue.append((idx, current_prediction_idx))

        head = 0
        predictions_per_batch = []  # TODO/Jan: Type!
        EOS_token = torch.LongTensor([data_utils.EOS_ID])

        while head < len(queue):
            init_h_states: list[torch.Tensor] = []
            init_c_states: list[torch.Tensor] = []
            decoder_inputs = []  # TODO/Jan: Type!
            attention_inputs: list[torch.Tensor] = []
            encoder_outputs = []  # TODO/Jan: Type!
            attention_masks = []  # TODO/Jan: Type!
            target_seqs_l: list[torch.Tensor] = []
            target_seqs_r: list[torch.Tensor] = []
            tree_idxes: list[tuple[int, int]] = []
            while head < len(queue):
                current_node = prediction_managers[queue[head][0]].get_node(
                    queue[head][1]
                )
                target_manager_idx = queue[head][0]
                target_idx = current_node.target
                if target_idx is not None:
                    target_node = decoder_managers[target_manager_idx].get_node(
                        target_idx
                    )
                else:
                    target_node = None
                if target_node is not None:
                    init_h_state = current_node.state[0]
                    init_c_state = current_node.state[1]
                    if init_h_state.shape[0] != self.num_layers:
                        init_h_state = torch.cat([init_h_state] * self.num_layers, dim=0)
                        init_c_state = torch.cat([init_c_state] * self.num_layers, dim=0)
                    init_h_states.append(init_h_state)
                    init_c_states.append(init_c_state)
                    tree_idxes.append((queue[head][0], queue[head][1]))
                    decoder_input = current_node.value
                    decoder_inputs.append(decoder_input)
                    if current_node.attention is None:
                        attention_input = torch.zeros(self.hidden_size)
                        if self.cuda_flag:
                            attention_input = attention_input.cuda()
                    else:
                        attention_input = current_node.attention
                    attention_inputs.append(attention_input)
                    if queue[head][1] == 0:
                        target_seq_l = target_node.value
                        target_seq_r = EOS_token
                    else:
                        if target_node is not None and target_node.lchild is not None:
                            target_seq_l = (
                                decoder_managers[target_manager_idx]
                                .get_node(target_node.lchild)
                                .value
                            )
                        else:
                            target_seq_l = EOS_token
                        if target_node is not None and target_node.rchild is not None:
                            target_seq_r = (
                                decoder_managers[target_manager_idx]
                                .get_node(target_node.rchild)
                                .value
                            )
                        else:
                            target_seq_r = EOS_token
                    target_seqs_l.append(target_seq_l)
                    target_seqs_r.append(target_seq_r)
                    encoder_outputs.append(init_encoder_outputs[queue[head][0]])
                    attention_masks.append(init_attention_masks[queue[head][0]])
                head += 1
            if len(tree_idxes) == 0:
                break
            init_h_states = torch.stack(init_h_states, dim=1)
            init_c_states = torch.stack(init_c_states, dim=1)
            decoder_inputs = torch.stack(decoder_inputs, dim=0)
            attention_inputs = torch.stack(attention_inputs, dim=0).unsqueeze(1)
            target_seqs_l: torch.Tensor = torch.cat(target_seqs_l, 0)
            target_seqs_r: torch.Tensor = torch.cat(target_seqs_r, 0)
            if self.cuda_flag:
                decoder_inputs = decoder_inputs.cuda()
                target_seqs_l = target_seqs_l.cuda()
                target_seqs_r = target_seqs_r.cuda()
            encoder_outputs: torch.Tensor = torch.stack(encoder_outputs, dim=0)
            attention_masks: torch.Tensor = torch.stack(attention_masks, dim=0)

            (
                predictions_logits_l,
                predictions_logits_r,
                states_l,
                states_r,
                attention_outputs_l,
                attention_outputs_r,
            ) = self.decode(
                encoder_outputs,
                attention_masks,
                (init_h_states, init_c_states),
                decoder_inputs,
                attention_inputs,
            )
            predictions_per_batch.append((predictions_logits_l, target_seqs_l))
            predictions_per_batch.append((predictions_logits_r, target_seqs_r))

            if feed_previous:
                predictions_l = predictions_logits_l.max(1)[1]
                predictions_r = predictions_logits_r.max(1)[1]

            for i in range(len(tree_idxes)):
                current_prediction_manager_idx, current_prediction_idx = tree_idxes[i]
                target_manager_idx = current_prediction_manager_idx
                current_prediction_tree = prediction_managers[
                    current_prediction_manager_idx
                ].get_node(current_prediction_idx)
                target_idx = current_prediction_tree.target
                if target_idx is None:
                    target_node = None
                else:
                    target_node = decoder_managers[target_manager_idx].get_node(
                        target_idx
                    )
                if feed_previous is False:
                    if current_prediction_idx == 0:
                        nxt_l_prediction_idx = prediction_managers[
                            current_prediction_manager_idx
                        ].create_node(
                            target_node.value,
                            current_prediction_idx,
                            current_prediction_tree.depth + 1,
                        )
                        prediction_managers[current_prediction_manager_idx].get_node(
                            current_prediction_idx
                        ).lchild = nxt_l_prediction_idx
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).target = target_idx
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).state = states_l[0][:, i, :], states_l[1][:, i, :]
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).attention = attention_outputs_l[i]
                        queue.append(
                            (current_prediction_manager_idx, nxt_l_prediction_idx)
                        )
                    else:
                        if target_node.lchild is not None:
                            nxt_l_prediction_idx = prediction_managers[
                                current_prediction_manager_idx
                            ].create_node(
                                decoder_managers[target_manager_idx]
                                .get_node(target_node.lchild)
                                .value,
                                current_prediction_idx,
                                current_prediction_tree.depth + 1,
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_l_prediction_idx).target = target_node.lchild
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                current_prediction_idx
                            ).lchild = nxt_l_prediction_idx
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_l_prediction_idx).state = (
                                states_l[0][:, i, :],
                                states_l[1][:, i, :],
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                nxt_l_prediction_idx
                            ).attention = attention_outputs_l[i]
                            queue.append(
                                (current_prediction_manager_idx, nxt_l_prediction_idx)
                            )
                        if target_idx == 0:
                            continue
                        if target_node.rchild is not None:
                            nxt_r_prediction_idx = prediction_managers[
                                current_prediction_manager_idx
                            ].create_node(
                                decoder_managers[target_manager_idx]
                                .get_node(target_node.rchild)
                                .value,
                                current_prediction_idx,
                                current_prediction_tree.depth + 1,
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_r_prediction_idx).target = target_node.rchild
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                current_prediction_idx
                            ).rchild = nxt_r_prediction_idx
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_r_prediction_idx).state = (
                                states_r[0][:, i, :],
                                states_r[1][:, i, :],
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                nxt_r_prediction_idx
                            ).attention = attention_outputs_r[i]
                            queue.append(
                                (current_prediction_manager_idx, nxt_r_prediction_idx)
                            )
                else:
                    if current_prediction_idx == 0:
                        nxt_l_prediction_idx = prediction_managers[
                            current_prediction_manager_idx
                        ].create_node(
                            predictions_l[i].item(),
                            current_prediction_idx,
                            current_prediction_tree.depth + 1,
                        )
                        prediction_managers[current_prediction_manager_idx].get_node(
                            current_prediction_idx
                        ).lchild = nxt_l_prediction_idx
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).prediction = predictions_l[i].item()
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).target = target_idx
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).state = states_l[0][:, i, :], states_l[1][:, i, :]
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_l_prediction_idx
                        ).attention = attention_outputs_l[i]
                        queue.append(
                            (current_prediction_manager_idx, nxt_l_prediction_idx)
                        )
                    else:
                        if predictions_l[i].item() != data_utils.EOS_ID:
                            if target_node is None or target_node.lchild is None:
                                nxt_l_prediction_idx = prediction_managers[
                                    current_prediction_manager_idx
                                ].create_node(
                                    predictions_l[i].item(),
                                    current_prediction_idx,
                                    current_prediction_tree.depth + 1,
                                )
                                prediction_managers[
                                    current_prediction_manager_idx
                                ].get_node(nxt_l_prediction_idx).target = None
                            else:
                                nxt_l_prediction_idx = prediction_managers[
                                    current_prediction_manager_idx
                                ].create_node(
                                    predictions_l[i].item(),
                                    current_prediction_idx,
                                    current_prediction_tree.depth + 1,
                                )
                                prediction_managers[
                                    current_prediction_manager_idx
                                ].get_node(
                                    nxt_l_prediction_idx
                                ).target = target_node.lchild
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                current_prediction_idx
                            ).lchild = nxt_l_prediction_idx
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_l_prediction_idx).prediction = predictions_l[
                                i
                            ].item()
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_l_prediction_idx).state = (
                                states_l[0][:, i, :],
                                states_l[1][:, i, :],
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(
                                nxt_l_prediction_idx
                            ).attention = attention_outputs_l[i]
                            queue.append(
                                (current_prediction_manager_idx, nxt_l_prediction_idx)
                            )
                        if target_idx == 0:
                            continue
                        if predictions_r[i].item() == data_utils.EOS_ID:
                            continue
                        if target_node is None or target_node.rchild is None:
                            nxt_r_prediction_idx = prediction_managers[
                                current_prediction_manager_idx
                            ].create_node(
                                predictions_r[i].item(),
                                current_prediction_idx,
                                current_prediction_tree.depth + 1,
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_r_prediction_idx).target = None
                        else:
                            nxt_r_prediction_idx = prediction_managers[
                                current_prediction_manager_idx
                            ].create_node(
                                predictions_r[i].item(),
                                current_prediction_idx,
                                current_prediction_tree.depth + 1,
                            )
                            prediction_managers[
                                current_prediction_manager_idx
                            ].get_node(nxt_r_prediction_idx).target = target_node.rchild
                        prediction_managers[current_prediction_manager_idx].get_node(
                            current_prediction_idx
                        ).rchild = nxt_r_prediction_idx
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_r_prediction_idx
                        ).prediction = predictions_r[i].item()
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_r_prediction_idx
                        ).state = states_r[0][:, i, :], states_r[1][:, i, :]
                        prediction_managers[current_prediction_manager_idx].get_node(
                            nxt_r_prediction_idx
                        ).attention = attention_outputs_r[i]
                        queue.append(
                            (current_prediction_manager_idx, nxt_r_prediction_idx)
                        )
        return predictions_per_batch, prediction_managers

    def get_batch(self, data: data_utils.EncodedDataset, start_idx: int):
        encoder_managers: list[BinaryTreeManager] = []
        decoder_managers: list[BinaryTreeManager] = []

        for i in range(self.batch_size):
            if i + start_idx >= len(data):
                break
            encoder_input, decoder_input, encoder_manager, decoder_manager = data[
                i + start_idx
            ]
            encoder_managers.append(encoder_manager)
            decoder_managers.append(decoder_manager)

        return encoder_managers, decoder_managers
