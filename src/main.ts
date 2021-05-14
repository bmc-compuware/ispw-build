import { CesRequestBody } from './types/CesRequestBody';
/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import * as core from '@actions/core';
import { URL } from 'url';
import { BuildAuto } from './types/BuildAuto';
import { BuildParms } from './types/BuildParms';

const utils = require('@bmc-compuware/ispw-action-utilities');
const axios = require('axios').default;

export async function run() {
    try {
        let keys = ['build_automatically', 'application', 'assignment_id', 'level', 'mname', 'mtype', 'task_id', 'ces_url',
            'ces_token', 'srid', 'runtime_configuration', 'change_type', 'execution_status'];

        let keyValues: Object = utils.retrieveInputs(core, keys);
        let keyValueJson = utils.convertObjectToJson(keyValues);
        core.debug('ISPW: raw data = ' + keyValueJson);

        let buildParms: BuildParms = utils.parseStringAsJson(keyValueJson);
        core.debug('ISPW: buildParms = ' + utils.convertObjectToJson(buildParms));

        if (utils.stringHasContent(buildParms.build_automatically)) {
            console.log('Build parameters are being retrieved from the build_automatically input.');

            let buildAuto: BuildAuto = utils.parseStringAsJson(buildParms.build_automatically);
            console.debug('ISPW: buildAuto=', utils.convertObjectToJson(buildAuto));

            if (buildAuto.taskIds) {
                buildParms.task_id = buildAuto.taskIds.join(',')
            }
        } else {
            console.log('Build parameters are being retrieved from the inputs.');
        }

        core.debug('ISPW: redefined buildParms: ' + utils.convertObjectToJson(buildParms));

        const requiredFields = ['task_id'];
        if (!utils.validateBuildParms(buildParms, requiredFields)) {
            throw new MissingArgumentException(
                'Inputs required for ispw-build are missing. ' +
                '\nSkipping the build request....');
        }

        const reqPath: string = getGenerateAwaitUrlPath(buildParms);
        const reqUrl: URL = utils.assembleRequestUrl(buildParms.ces_url, reqPath);
        core.debug('ISPW: request url: ' + reqUrl.href);

        const reqBodyObj = assembleRequestBodyObject(buildParms.runtime_configuration, buildParms.change_type, buildParms.execution_status);
        core.debug('ISPW: request body: ' + utils.convertObjectToJson(reqBodyObj));



        utils.getHttpPostPromise(reqUrl, buildParms.ces_token, reqBodyObj)
            .then(
                (response: any) => {
                    core.debug('ISPW: received response body: ' + utils.convertObjectToJson(response.data));
                    // generate could have passed or failed
                    setOutputs(response.data);
                    return handleResponseBody(response.data);
                },
                (error: any) => {
                    // there was a problem with the request to CES
                    if (error.response !== undefined) {
                        core.debug('ISPW: received error code: ' + error.response.status);
                        core.debug('ISPW: received error response body: ' +
                            utils.convertObjectToJson(error.response.data));
                        setOutputs(error.response.data);
                        throw new GenerateFailureException(error.response.data.message);
                    }
                    throw error;
                })
            .then(() => console.log('The build request completed successfully.'),
                (error: any) => {
                    core.debug(error.stack);
                    core.setFailed(error.message);
                });

        // the following code will execute after the HTTP request was started,
        // but before it receives a response.
        if (buildParms.task_id) {
            console.log('Starting the build process for task ' + buildParms.task_id.toString());
        }
    } catch (error) {
        if (error instanceof MissingArgumentException) {
            // this would occur if there was nothing to load during the sync process
            // no need to fail the action if the generate is never attempted
            console.log(error.message);
        } else {
            core.debug(error.stack);
            console.error('An error occurred while starting the build');
            core.setFailed(error.message);
        }
    }
}

function getHttpPostPromise(requestUrl : URL, token : string, requestBody : any) {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    };

    return axios.post(requestUrl.href, requestBody, options);
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
function handleResponseBody(responseBody: any): any {
    if (responseBody === undefined) {
        // empty response
        throw new GenerateFailureException(
            'No response was received from the build request.');
    } else if (responseBody.awaitStatus === undefined) {
        // Build did not complete - there should be a message returned
        if (responseBody.message !== undefined) {
            throw new GenerateFailureException(responseBody.message);
        }
        throw new GenerateFailureException('The build request did not complete successfully.');
    } else if (responseBody.awaitStatus.generateFailedCount !== 0) {
        // there were generate failures
        console.error(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
        throw new GenerateFailureException('There were build failures.');
    } else {
        // success
        console.log(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
        return responseBody;
    }
}

/**
 * Takes the fields from the response body and sends them to the outputs of
 * the job
 * @param {*} responseBody the response body received from the REST API request
 */
function setOutputs(responseBody: any) {
    if (responseBody) {
        core.setOutput('set_id', responseBody.setId);
        core.setOutput('url', responseBody.url);
        core.setOutput('assignment_id', responseBody.assignmentId);

        const isTimedOut = utils.stringHasContent(responseBody.message) &&
            responseBody.message.includes('timed out');
        core.setOutput('is_timed_out', isTimedOut);

        if (responseBody.awaitStatus) {
            core.setOutput('generate_failed_count', responseBody.awaitStatus.generateFailedCount);
            core.setOutput('generate_success_count', responseBody.awaitStatus.generateSuccessCount);
            core.setOutput('has_failures', responseBody.awaitStatus.hasFailures);
            core.setOutput('task_count', responseBody.awaitStatus.taskCount);
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
function assembleRequestBodyObject(runtimeConfig: string | undefined, changeType: string | undefined,
    executionStatus: string | undefined): CesRequestBody {
    const requestBody: CesRequestBody = {};

    if (utils.stringHasContent(runtimeConfig)) {
        requestBody.runtimeConfiguration = runtimeConfig;
    }
    if (utils.stringHasContent(changeType)) {
        requestBody.changeType = changeType;
    }
    if (utils.stringHasContent(executionStatus)) {
        requestBody.execStatus = executionStatus;
    }

    return requestBody;
}

/**
 * Gets the request path for the CES REST api ispw-await on tasks. The returned path starts with
 * '/ispw/' and ends with the query parameters
 * 
 * @param buildParms The build parms to use when filling out the request url
 * @return the request path which can be appended to the CES url
 */
function getGenerateAwaitUrlPath(buildParms: BuildParms) {
    let tempUrlStr = `/ispw/${buildParms.srid}/build-await?`;
    let taskIds: string[] | undefined = buildParms.task_id?.split(',');

    if (taskIds) {
        taskIds.forEach((id) => {
            tempUrlStr = tempUrlStr.concat(`taskId=${id}&`);
        });
    } else {
        core.setFailed('Failed to parse task ids from input');
    }
    return tempUrlStr;
}

/**
 * Error to throw when not all the arguments have been specified for the action.
 * 
 * @param message the message associated with the error
 */
class MissingArgumentException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MissingArgumentException';
    }
}

/**
 * Error to throw when the response for the generate request is incomplete
 *  or indicates errors.
 * 
 * @param message the message associated with the error
 */
class GenerateFailureException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GenerateFailureException';
    }
}

