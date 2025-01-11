/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {Klass, LexicalNode} from 'lexical';

import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {HashtagNode} from '@lexical/hashtag';
import {ListItemNode, ListNode} from '@lexical/list';
import {OverflowNode} from '@lexical/overflow';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';

import {KeywordNode} from './KeywordNode';
import {LayoutContainerNode} from './LayoutContainerNode';
import {LayoutItemNode} from './LayoutItemNode';
import {LinkNode, AutoLinkNode} from '@lexical/link'

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  OverflowNode,
  LinkNode,
  AutoLinkNode,
  KeywordNode,
  HorizontalRuleNode,
  LayoutContainerNode,
  LayoutItemNode,
];

export default PlaygroundNodes;
