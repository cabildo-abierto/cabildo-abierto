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
  settings?: any
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
  settings
}: Props): JSX.Element {
  return (
    <ContentEditable
      spellCheck={false}
      className={className ?? ('ContentEditable__root' + ((settings && settings.isDraggableBlock) ? " pl-6" : ""))}
      aria-placeholder={placeholder}
      placeholder={
        <div className={placeholderClassName ? placeholderClassName : (('ContentEditable__placeholder' + ((settings && settings.isDraggableBlock) ? " left-6" : "")))}>
          {placeholder}
        </div>
      }
    />
  );
}
