/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {CA_TRANSFORMERS} from "@/components/editor/markdown-transformers/ca-transformers";


export default function MarkdownPlugin() {
  return <MarkdownShortcutPlugin transformers={CA_TRANSFORMERS} />;
}
