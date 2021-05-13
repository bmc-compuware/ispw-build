/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import * as core from '@actions/core'
import { BuildAuto } from './types/BuildAuto';
import { BuildParms } from './types/BuildParms'
const utils = require('@bmc-compuware/ispw-action-utilities');

export async function run() {

    let buildAuto : BuildAuto | undefined;

    let inputs = ['build_automatically', 'application', 'assignment_id', 'level', 'mname', 'mtype', 'task_id', 'ces_url',
        'ces_token', 'srid', 'runtime_configuration', 'change_type', 'execution_status'];
    inputs = utils.retrieveInputs(core, inputs);

    core.debug('ISPW: parsed inputs: ' + utils.convertObjectToJson(inputs));

    let buildParms : BuildParms = utils.parseStringAsJson((utils.convertObjectToJson(inputs))) ;
    core.debug("1: url="+ buildParms.ces_url+', runtime='+buildParms.runtime_configuration
        +', srid='+buildParms.srid+', typeof='+typeof(buildParms.build_automatically+', auto='+buildParms.build_automatically))
    if (utils.stringHasContent(buildParms.build_automatically)) {
        console.log('Generate parameters are being retrieved from the ' +
            'generate_automatically input.');
        //buildParms = utils.parseStringAsJson(inputs.build_automatically);
        let buildAuto: BuildAuto = utils.parseStringAsJson(buildParms.build_automatically);
        console.debug('2: buildAuto=', utils.convertObjectToJson(buildAuto))
        console.debug(buildAuto.containerId+',typeof='+typeof(buildAuto.taskIds)+', length='+buildAuto.taskIds[0]);
    } else {
        console.log('Generate parameters are being retrieved from the inputs.');
        //buildParms = getParmsFromInputs(inputs.assignment_id, inputs.level, inputs.task_id);
        console.debug('buildParms=', utils.convertObjectToJson(buildParms))
    }

    core.debug('ISPW: parsed buildParms: ' + utils.convertObjectToJson(buildParms));
}

