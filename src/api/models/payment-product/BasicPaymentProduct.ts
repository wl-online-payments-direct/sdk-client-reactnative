/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2024 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */

import {
  AccountOnFile,
  type AccountOnFileJSON,
} from './account-on-file/AccountOnFile';
import type { PaymentProductDisplayHints } from './PaymentProductDisplayHints';
import type { PaymentProduct302SpecificData } from './specific-data/PaymentProduct302SpecificData';
import type { PaymentProduct320SpecificData } from './specific-data/PaymentProduct320SpecificData';

export interface BasicPaymentProductJSON {
  readonly id: string;
  readonly paymentMethod: string;
  readonly paymentProductGroup?: string;
  readonly allowsRecurring: boolean;
  readonly allowsTokenization: boolean;
  readonly usesRedirectionTo3rdParty: boolean;
  readonly displayHintsList?: PaymentProductDisplayHints[];
  readonly accountsOnFile?: AccountOnFileJSON[];
  readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData;
  readonly paymentProduct320SpecificData?: PaymentProduct320SpecificData;
}

export class BasicPaymentProduct {
  readonly id: string;
  readonly paymentMethod: string;
  readonly paymentProductGroup?: string;
  readonly allowsRecurring: boolean;
  readonly allowsTokenization: boolean;
  readonly usesRedirectionTo3rdParty: boolean;
  readonly displayHintsList: PaymentProductDisplayHints[];
  readonly accountsOnFile: AccountOnFile[] = [];
  readonly paymentProduct302SpecificData?: PaymentProduct302SpecificData;
  readonly paymentProduct320SpecificData?: PaymentProduct320SpecificData;

  constructor(json: BasicPaymentProductJSON) {
    this.id = json.id;
    this.paymentMethod = json.paymentMethod;
    this.paymentProductGroup = json.paymentProductGroup;
    this.allowsRecurring = json.allowsRecurring;
    this.allowsTokenization = json.allowsTokenization;
    this.usesRedirectionTo3rdParty = json.usesRedirectionTo3rdParty;
    this.displayHintsList = json.displayHintsList ?? [];

    const accountsOnFileJSON = json.accountsOnFile ?? [];
    for (var accountOnFileJSON of accountsOnFileJSON) {
      this.accountsOnFile.push(new AccountOnFile(accountOnFileJSON));
    }

    this.paymentProduct302SpecificData = json.paymentProduct302SpecificData;
    this.paymentProduct320SpecificData = json.paymentProduct320SpecificData;
  }
}
