/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import { BuildAuto } from '../src/types/BuildAuto';
import { BuildParms } from '../src/types/BuildParms';

const main = require('../src/main');

describe('entity tests', () => {
    it('buildparms', async () => {
        let buildParms: BuildParms = {
            "build_automatically": "build_automatically",
            "level": "DEV1", "task_id": "7E53CC8FB3D6, 7E53CC8FB3D6, 7E53CC8FB3D6",
            "ces_url": "http://localhost:48226/", "ces_token": "token1", "srid": "srid1", "runtime_configuration": "ISPW",
            "change_type": "T", "execution_status": "E"
        };
        expect(buildParms.level).toBe('DEV1');
        expect(buildParms.task_id).toBe('7E53CC8FB3D6, 7E53CC8FB3D6, 7E53CC8FB3D6');
        expect(buildParms.runtime_configuration).toBe('ISPW');
        expect(buildParms.build_automatically).toBe('build_automatically');
        expect(buildParms.ces_token).toBe('token1');
        expect(buildParms.ces_url).toBe('http://localhost:48226/');
        expect(buildParms.execution_status).toBe('E');
        expect(buildParms.change_type).toBe('T');
        expect(buildParms.srid).toBe('srid1');
    })

    it('buildauto', async () => {
        let buildAuto: BuildAuto = { "containerId": "PLAY004799", "releaseId": " ", "taskLevel": "DEV2", "taskIds": ["7E53CC8FB3D6", "7E53CC8FB3D7"] };
        expect(buildAuto.containerId).toBe('PLAY004799');
        expect(buildAuto.releaseId).toBe(' ');
        expect(buildAuto.taskLevel).toBe('DEV2');
        expect(buildAuto.taskIds[0]).toBe('7E53CC8FB3D6');
        expect(buildAuto.taskIds[1]).toBe('7E53CC8FB3D7');
    })
})
