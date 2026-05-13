/*
 * Do not remove or alter the notices in this preamble.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

/**
 * Awaiting a promise x times
 */
export async function awaitTimes(
  num: number,

  fn: () => Promise<any>
) {
  for (let i = 0; i < num; i++) {
    await fn();
  }
}
