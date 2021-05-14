/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import * as core from '@actions/core';
import { BuildAuto } from './types/BuildAuto';
import { BuildParms } from './types/BuildParms';

const utils = require('@bmc-compuware/ispw-action-utilities');

export async function run() {
    let keys = ['build_automatically', 'application', 'assignment_id', 'level', 'mname', 'mtype', 'task_id', 'ces_url',
        'ces_token', 'srid', 'runtime_configuration', 'change_type', 'execution_status'];

    let keyValues: Object = utils.retrieveInputs(core, keys);
    let keyValueJson = utils.convertObjectToJson(keyValues);
    core.debug('ISPW: raw data = ' + keyValueJson);

    let buildParms: BuildParms = utils.parseStringAsJson(keyValueJson);
    core.debug('ISPW: buildParms = ' + utils.convertObjectToJson(buildParms));

    if (utils.stringHasContent(buildParms.build_automatically)) {
        console.log('Generate parameters are being retrieved from the generate_automatically input.');

        let buildAuto: BuildAuto = utils.parseStringAsJson(buildParms.build_automatically);
        console.debug('ISPW: buildAuto=', utils.convertObjectToJson(buildAuto));

        if (buildAuto.taskIds) {
            buildParms.task_id = buildAuto.taskIds.join(',')
        }
    } else {
        console.log('Generate parameters are being retrieved from the inputs.');
    }

    core.debug('ISPW: redefined buildParms: ' + utils.convertObjectToJson(buildParms));
}

