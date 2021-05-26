/**
 * ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
 * ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
 *
 * (c) Copyright 2021 BMC Software, Inc.
 * This code is licensed under MIT license (see LICENSE.txt for details)
 */
import {CesRequestBody} from '../src/types/CesRequestBody'
import {BuildParms} from '../src/types/BuildParms'
import {Inputs} from '../src/types/Inputs'
const main = require('../src/main')

describe('entity tests', () => {
  it('inputs', async () => {
    let inputs: Inputs = {
      build_automatically: 'build_automatically',
      task_id: '7E53CC8FB3D6, 7E53CC8FB3D6, 7E53CC8FB3D6',
      ces_url: 'http://localhost:48226/',
      ces_token: 'token1',
      srid: 'srid1',
      runtime_configuration: 'ISPW',
      change_type: 'T',
      execution_status: 'E'
    }
    expect(inputs.task_id).toBe('7E53CC8FB3D6, 7E53CC8FB3D6, 7E53CC8FB3D6')
    expect(inputs.runtime_configuration).toBe('ISPW')
    expect(inputs.build_automatically).toBe('build_automatically')
    expect(inputs.ces_token).toBe('token1')
    expect(inputs.ces_url).toBe('http://localhost:48226/')
    expect(inputs.execution_status).toBe('E')
    expect(inputs.change_type).toBe('T')
    expect(inputs.srid).toBe('srid1')
  })

  it('buildParms', async () => {
    let buildParms: BuildParms = {
      containerId: 'PLAY004799',
      releaseId: ' ',
      taskLevel: 'DEV2',
      taskIds: ['7E53CC8FB3D6', '7E53CC8FB3D7']
    }
    expect(buildParms.containerId).toBe('PLAY004799')
    expect(buildParms.releaseId).toBe(' ')
    expect(buildParms.taskLevel).toBe('DEV2')
    expect(buildParms.taskIds).toBeDefined()
    if (buildParms.taskIds) {
      expect(buildParms.taskIds[0]).toBe('7E53CC8FB3D6')
      expect(buildParms.taskIds[1]).toBe('7E53CC8FB3D7')
    }
  })

  it('cesrequestbody', async () => {
    let requestBody: CesRequestBody = {
      runtimeConfiguration: 'TPZP',
      changeType: 'S',
      execStatus: 'I'
    }
    expect(requestBody.changeType).toBe('S')
    expect(requestBody.execStatus).toBe('I')
    expect(requestBody.runtimeConfiguration).toBe('TPZP')
  })
})

describe('main tests', () => {
  it('getParmsFromInputs', () => {
    let output = main.getParmsFromInputs(undefined)
    expect(output).toBeDefined()
    expect(output).toEqual({})
    expect(output.taskIds).toBeUndefined()

    output = main.getParmsFromInputs('abc')
    expect(output).toBeDefined()
    expect(output).toEqual({taskIds: ['abc']})
    expect(output.taskIds).toEqual(['abc'])

    output = main.getParmsFromInputs('abc,123')
    expect(output).toBeDefined()
    expect(output).toEqual({taskIds: ['abc', '123']})
    expect(output.taskIds).toEqual(['abc', '123'])
  })

  it('handleResponseBody', () => {
    expect(() => {
      main.handleResponseBody(undefined)
    }).toThrow('No response was received from the build request.')

    expect(() => {
      main.handleResponseBody({})
    }).toThrow('The build request did not complete successfully.')

    expect(() => {
      main.handleResponseBody({message: 'this is a message'})
    }).toThrow('this is a message')

    expect(() => {
      main.handleResponseBody({
        message: 'this is a message',
        awaitStatus: {
          generateFailedCount: 4,
          statusMsg: 'failure status'
        }
      })
    }).toThrow('There were build failures.')

    expect(
      main.handleResponseBody({
        message: 'this is a message',
        awaitStatus: {
          generateFailedCount: 0,
          statusMsg: 'failure status'
        }
      })
    ).toEqual({
      message: 'this is a message',
      awaitStatus: {
        generateFailedCount: 0,
        statusMsg: 'failure status'
      }
    })
  })

  it('assembleRequestBodyObject', () => {
    expect(main.assembleRequestBodyObject(undefined, undefined, undefined)).toEqual({})

    expect(main.assembleRequestBodyObject('TPZ', undefined, undefined)).toEqual({
      runtimeConfiguration: 'TPZ'
    })

    expect(main.assembleRequestBodyObject(undefined, 'S', undefined)).toEqual({changeType: 'S'})

    expect(main.assembleRequestBodyObject(undefined, undefined, 'H')).toEqual({execStatus: 'H'})

    expect(main.assembleRequestBodyObject('TPZ', 'I', 'H')).toEqual({
      runtimeConfiguration: 'TPZ',
      changeType: 'I',
      execStatus: 'H'
    })
  })

  it('getBuildAwaitUrlPath', () => {
    expect(main.getBuildAwaitUrlPath('ISPW', {})).toEqual('/ispw/ISPW/build-await')

    expect(main.getBuildAwaitUrlPath('ISPW', {taskIds: ['first']})).toEqual(
      '/ispw/ISPW/build-await?taskId=first'
    )

    expect(main.getBuildAwaitUrlPath('ISPW', {taskIds: ['first', 'second']})).toEqual(
      '/ispw/ISPW/build-await?taskId=first&taskId=second'
    )
  })
})
