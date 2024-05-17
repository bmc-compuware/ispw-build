/**
 * ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
 * SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
 * RESPECTIVE OWNERS.
 *
 * (c) Copyright 2021 BMC Software, Inc.
 * This code is licensed under MIT license (see LICENSE.txt for details)
 */
import * as core from '@actions/core'
import {URL} from 'url'
import {BuildParms} from './types/BuildParms'
import {Inputs} from './types/Inputs'
import {CesRequestBody} from './types/CesRequestBody'

const utils = require('@bmc-compuware/ispw-action-utilities')

export async function run(): Promise<void> {
  try {
    const keys = [
      'build_automatically',
      'task_id',
      'ces_url',
      'ces_token',
      'srid',
      'runtime_configuration',
      'change_type',
      'execution_status'
    ]

    console.log('dev workflow');
    const inputs = utils.retrieveInputs(core, keys) as Inputs
    core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs))
    let buildParms: BuildParms
    if (utils.stringHasContent(inputs.build_automatically)) {
      console.log('Build parameters are being retrieved from the build_automatically input11.')

      buildParms = utils.parseStringAsJson(inputs.build_automatically) as BuildParms
    } else {
      console.log('Build parameters are being retrieved from the inputs check2.')
      buildParms = getParmsFromInputs(inputs.task_id)
    }
    core.debug('Code Pipeline: parsed buildParms: ' + utils.convertObjectToJson(buildParms))

    const requiredFields = ['taskIds']
    if (!utils.validateBuildParms(buildParms, requiredFields)) {
      throw new MissingArgumentException(
        'Inputs required for Code Pipeline Build are missing. ' + '\nSkipping the build request....'
      )
    }

    const reqPath: string = getBuildAwaitUrlPath(inputs.srid, buildParms)
    const reqUrl: URL = utils.assembleRequestUrl(inputs.ces_url, reqPath)
    core.debug('Code Pipeline: request url: ' + reqUrl.href)

    const reqBodyObj: CesRequestBody = assembleRequestBodyObject(
      inputs.runtime_configuration,
      inputs.change_type,
      inputs.execution_status
    )
    core.debug('Code Pipeline: request body: ' + utils.convertObjectToJson(reqBodyObj))

    if (buildParms.taskIds) {
      console.log('Starting the build process for task ' + buildParms.taskIds.toString())
    }

    await utils
      .getHttpPostPromise(reqUrl, inputs.ces_token, reqBodyObj)
      .then(
        (response: any) => {
          core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data))
          // build could have passed or failed
          setOutputs(response.data)
          return handleResponseBody(response.data)
        },
        (error: any) => {
          // there was a problem with the request to CES
          if (error.response !== undefined) {
            core.debug('Code Pipeline: received error code: ' + error.response.status)
            core.debug(
              'Code Pipeline: received error response body: ' +
                utils.convertObjectToJson(error.response.data)
            )
            setOutputs(error.response.data)
            if (error.response.data) {
              throw new GenerateFailureException(error.response.data.message)
            }
            else {
              throw new GenerateFailureException('There was a problem with the request to CES1')
            }
          }
          throw error
        }
      )
      .then(
        () => console.log('The build request completed successfully. changes is reflecting'),
        (error: any) => {
          core.debug(error.stack)
          core.setFailed(error.message)
        }
      )

  } catch (error: any) {
    if (error instanceof MissingArgumentException) {
      // this would occur if there was nothing to load during the sync process
      // no need to fail the action if the generate is never attempted
      console.log(error.message)
    } else {
      core.debug(error.stack)
      console.error('An error occurred while starting the build')
      core.setFailed(error.message)
    }
  }
}

/**
 * Uses the input parameters from the action metadata to fill in a BuildParms
 * object.
 * @param  {string} inputTaskId the comma separated list of task IDs passed
 * into the action
 * @return {BuildParms} a BuildParms object with the fields filled in.
 * This will never return undefined.
 */
export function getParmsFromInputs(inputTaskId: string | undefined): BuildParms {
  const buildParms: BuildParms = {}
  if (inputTaskId && utils.stringHasContent(inputTaskId)) {
    buildParms.taskIds = inputTaskId.split(',')
  }
  return buildParms
}

/**
 * Examines the given response body to determine whether an error occurred
 * during the generate.
 * @param responseBody The body returned from the CES request
 * @return The response body object if the generate was successful,
 * else throws an error
 *
 * @throws GenerateFailureException if there were failures during the generate
 */
export function handleResponseBody(responseBody: any): any {
  if (responseBody === undefined) {
    // empty response
    throw new GenerateFailureException('No response was received from the build request.')
  } else if (responseBody.awaitStatus === undefined) {
    // Build did not complete - there should be a message returned
    if (responseBody.message !== undefined) {
      throw new GenerateFailureException(responseBody.message)
    }
    throw new GenerateFailureException('The build request did not complete successfully.')
  } else if (responseBody.awaitStatus.generateFailedCount !== 0) {
    // there were generate failures
    console.error(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg))
    throw new GenerateFailureException('There were build failures.')
  } else {
    // success
    console.log(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg))
    return responseBody
  }
}

/**
 * Takes the fields from the response body and sends them to the outputs of
 * the job
 * @param {*} responseBody the response body received from the REST API request
 */
function setOutputs(responseBody: any) {
  if (responseBody) {
    core.setOutput('output_json', utils.convertObjectToJson(responseBody))
    core.setOutput('set_id', responseBody.setId)
    core.setOutput('url', responseBody.url)
    core.setOutput('assignment_id', responseBody.assignmentId)

    const isTimedOut =
      utils.stringHasContent(responseBody.message) && responseBody.message.includes('timed out')
    core.setOutput('is_timed_out', isTimedOut)

    if (responseBody.awaitStatus) {
      core.setOutput('generate_failed_count', responseBody.awaitStatus.generateFailedCount)
      core.setOutput('generate_success_count', responseBody.awaitStatus.generateSuccessCount)
      core.setOutput('has_failures', responseBody.awaitStatus.hasFailures)
      core.setOutput('task_count', responseBody.awaitStatus.taskCount)
    }
  }
}

/**
 * Assembles an object for the CES request body.
 * @param  runtimeConfig the runtime configuration passed
 * in the inputs
 * @param  changeType the change type passed in the inputs
 * @param  executionStatus the execution status passed
 * in the inputs
 * @return an CesRequestBody with all the fields for the request body filled in
 */
export function assembleRequestBodyObject(
  runtimeConfig: string | undefined,
  changeType: string | undefined,
  executionStatus: string | undefined
): CesRequestBody {
  const requestBody: CesRequestBody = {}

  if (utils.stringHasContent(runtimeConfig)) {
    requestBody.runtimeConfiguration = runtimeConfig
  }
  if (utils.stringHasContent(changeType)) {
    requestBody.changeType = changeType
  }
  if (utils.stringHasContent(executionStatus)) {
    requestBody.execStatus = executionStatus
  }

  return requestBody
}

/**
 * Gets the request path for the CES REST api ispw-await on tasks. The returned path starts with
 * '/ispw/' and ends with the query parameters
 *
 * @param buildParms The build parms to use when filling out the request url
 * @return the request path which can be appended to the CES url
 */
export function getBuildAwaitUrlPath(srid: string, buildParms: BuildParms) {
  let tempUrlStr = `/ispw/${srid}/build-await?`
  if (buildParms.taskIds) {
    buildParms.taskIds.forEach(id => {
      tempUrlStr = tempUrlStr.concat(`taskId=${id}&`)
    })
  }
  tempUrlStr = tempUrlStr.slice(0, -1)
  return tempUrlStr
}

/**
 * Error to throw when not all the arguments have been specified for the action.
 *
 * @param message the message associated with the error
 */
export class MissingArgumentException extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, MissingArgumentException.prototype)
    this.name = 'MissingArgumentException'
  }
}

/**
 * Error to throw when the response for the generate request is incomplete
 *  or indicates errors.
 *
 * @param message the message associated with the error
 */
export class GenerateFailureException extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, GenerateFailureException.prototype)
    this.name = 'GenerateFailureException'
  }
}
