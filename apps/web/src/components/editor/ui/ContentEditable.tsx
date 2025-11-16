/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './ContentEditable.css';

import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import * as React from 'react';

type Props = {
  className?: string;
  placeholderClassName?: string;
  placeholder: string;
  editorClassName?: string
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
  editorClassName=""
}: Props) {
  return (
    <ContentEditable
      spellCheck={true}
      className={className ?? ('outline-none ' + editorClassName)}
      aria-placeholder={placeholder}
      placeholder={
        <div className={"pointer-events-none " + placeholderClassName}>
          {placeholder}
        </div>
      }
    />
  );
}
