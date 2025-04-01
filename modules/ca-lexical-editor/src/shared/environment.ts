/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {CAN_USE_DOM} from './canUseDOM';

declare global {
  interface Document {
    documentMode?: unknown;
  }

  interface Window {
    MSStream?: unknown;
  }
}

export const IS_APPLE: boolean =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
