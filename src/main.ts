/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import * as core from '@actions/core'
const utils = require('@bmc-compuware/ispw-action-utilities');

export async function run() {
    let buildParms;

    let inputs = ['build_automatically', 'assignment_id', 'level', 'task_id', 'ces_url',
        'ces_token', 'srid', 'runtime_configuration', 'change_type', 'execution_status', 'auto_deploy'];
    inputs = utils.retrieveInputs(core, inputs);

    console.log('ISPW: parsed inputs: ' + utils.convertObjectToJson(inputs));
}