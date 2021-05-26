/**
 * ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
 * SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
 * RESPECTIVE OWNERS.
 *
 * (c) Copyright 2021 BMC Software, Inc.
 * This code is licensed under MIT license (see LICENSE.txt for details)
 */
export interface BuildParms {
  containerId?: string
  releaseId?: string
  taskLevel?: string
  taskIds?: string[]
}
