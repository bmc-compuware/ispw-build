"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateFailureException = exports.MissingArgumentException = exports.isAuthTokenOrCerti = exports.getBuildAwaitUrlPath = exports.assembleRequestBodyObject = exports.handleResponseBody = exports.getParmsFromInputs = exports.run = void 0;
/**
 * ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
 * SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
 * RESPECTIVE OWNERS.
 *
 * (c) Copyright 2021-2026 BMC Software, Inc.
 * This code is licensed under MIT license (see LICENSE.txt for details)
 */
const core = __importStar(require("@actions/core"));
const utils = require('@bmc-compuware/ispw-action-utilities');
async function run() {
    try {
        const keys = [
            'build_automatically',
            'task_id',
            'ces_url',
            'ces_token',
            'certificate',
            'srid',
            'assignment_id',
            'level',
            'runtime_configuration',
            'change_type',
            'execution_status'
        ];
        const inputs = utils.retrieveInputs(core, keys);
        core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs));
        let buildParms;
        if (utils.stringHasContent(inputs.build_automatically)) {
            console.log('Build parameters are being retrieved from the build_automatically input.');
            buildParms = utils.parseStringAsJson(inputs.build_automatically);
        }
        else {
            console.log('Build parameters are being retrieved from the inputs.');
            buildParms = getParmsFromInputs(inputs.assignment_id, inputs.level, inputs.task_id);
        }
        core.debug('Code Pipeline: parsed buildParms: ' + utils.convertObjectToJson(buildParms));
        const reqPath = getBuildAwaitUrlPath(inputs.srid, buildParms, inputs.build_automatically);
        const reqUrl = utils.assembleRequestUrl(inputs.ces_url, reqPath);
        core.debug('Code Pipeline: request url: ' + reqUrl.href);
        // getting host port details from srid passed
        const hostAndPort = inputs.srid.split('-');
        const host = hostAndPort[0];
        const port = hostAndPort[1];
        const reqBodyObj = assembleRequestBodyObject(inputs.runtime_configuration, inputs.change_type, inputs.execution_status);
        core.debug('Code Pipeline: request body: ' + utils.convertObjectToJson(reqBodyObj));
        //processing the inputs if they are not retrieved from build_automatically
        if (!utils.stringHasContent(inputs.build_automatically)) {
            //Validating either taskIds or Assignment Ids with Level should be provided.
            if (!utils.stringHasContent(buildParms.containerId) &&
                !utils.stringHasContent(buildParms.taskIds)) {
                throw new Error('Either Task IDs or Assignment ID with Level required for Code Pipeline Build. ');
            }
            //Validating the Level value if Assignment ID value is specified.
            if (utils.stringHasContent(buildParms.containerId)) {
                if (!utils.stringHasContent(buildParms.taskLevel)) {
                    throw new Error('Assignment ID and Level are mandatory for the Code Pipeline build');
                }
            }
            //If both assignment and taskIds are given, ignore taskIds
            if (utils.stringHasContent(buildParms.containerId) &&
                utils.stringHasContent(buildParms.taskIds)) {
                console.log('If both Assignment ID and Task IDs are provided, the specified Task IDs will be ignored, and the build will be executed for all tasks associated with the given Assignment ID');
                console.log('Starting the build process assignment ' +
                    buildParms.containerId +
                    ' at level ' +
                    buildParms.taskLevel);
            }
            else {
                if (utils.stringHasContent(buildParms.containerId)) {
                    console.log('Starting the build process assignment ' +
                        buildParms.containerId +
                        ' at level ' +
                        buildParms.taskLevel);
                }
                else {
                    if (buildParms.taskIds && buildParms.taskIds.length > 0) {
                        console.log('Starting the build process for task ' + buildParms.taskIds.toString());
                    }
                }
            }
        }
        else {
            if (buildParms.taskIds && buildParms.taskIds.length > 0) {
                console.log('Starting the build process for task ' + buildParms.taskIds.toString());
            }
        }
        if (isAuthTokenOrCerti(inputs.ces_token, inputs.certificate)) {
            //for token
            console.log('Using ces_token as authentication method.');
            await utils
                .getHttpPostPromise(reqUrl, inputs.ces_token, reqBodyObj)
                .then((response) => {
                core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data));
                // build could have passed or failed
                setOutputs(response.data);
                return handleResponseBody(response.data);
            }, (error) => {
                // there was a problem with the request to CES
                if (error.response !== undefined) {
                    core.debug('Code Pipeline: received error code: ' + error.response.status);
                    core.debug('Code Pipeline: received error response body: ' +
                        utils.convertObjectToJson(error.response.data));
                    setOutputs(error.response.data);
                    if (error.response.data) {
                        throw new GenerateFailureException(error.response.data.message);
                    }
                    else {
                        throw new GenerateFailureException('There was a problem with the request to CES');
                    }
                }
                throw error;
            })
                .then(() => console.log('The build request completed successfully.'), (error) => {
                core.debug(error.stack);
                core.setFailed(error.message);
            });
        }
        else {
            //for certi
            console.log('Using certificate as authentication method.');
            await utils
                .getHttpPostPromiseWithCert(reqUrl, inputs.certificate, host, port, reqBodyObj)
                .then((response) => {
                core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data));
                // build could have passed or failed
                setOutputs(response.data);
                return handleResponseBody(response.data);
            }, (error) => {
                // there was a problem with the request to CES
                if (error.response !== undefined) {
                    core.debug('Code Pipeline: received error code: ' + error.response.status);
                    core.debug('Code Pipeline: received error response body: ' +
                        utils.convertObjectToJson(error.response.data));
                    setOutputs(error.response.data);
                    if (error.response.data) {
                        throw new GenerateFailureException(error.response.data.message);
                    }
                    else {
                        throw new GenerateFailureException('There was a problem with the request to CES');
                    }
                }
                throw error;
            })
                .then(() => console.log('The build request completed successfully.'), (error) => {
                core.debug(error.stack);
                core.setFailed(error.message);
            });
        }
    }
    catch (error) {
        if (error instanceof MissingArgumentException) {
            // this would occur if there was nothing to load during the sync process
            // no need to fail the action if the generate is never attempted
            console.log(error.message);
        }
        else {
            core.debug(error.stack);
            console.error('An error occurred while starting the build');
            core.setFailed(error.message);
        }
    }
}
exports.run = run;
/**
 * Uses the input parameters from the action metadata to fill in a BuildParms
 * object.
 * @param  {string} inputTaskId the comma separated list of task IDs passed
 * into the action
 * @return {BuildParms} a BuildParms object with the fields filled in.
 * This will never return undefined.
 */
function getParmsFromInputs(inputAssignment, inputLevel, inputTaskId) {
    const buildParms = {};
    if (utils.stringHasContent(inputAssignment)) {
        buildParms.containerId = inputAssignment;
    }
    if (utils.stringHasContent(inputLevel)) {
        buildParms.taskLevel = inputLevel;
    }
    if (inputTaskId && utils.stringHasContent(inputTaskId)) {
        buildParms.taskIds = inputTaskId.split(',');
    }
    return buildParms;
}
exports.getParmsFromInputs = getParmsFromInputs;
/**
 * Examines the given response body to determine whether an error occurred
 * during the generate.
 * @param responseBody The body returned from the CES request
 * @return The response body object if the generate was successful,
 * else throws an error
 *
 * @throws GenerateFailureException if there were failures during the generate
 */
function handleResponseBody(responseBody) {
    if (responseBody === undefined) {
        // empty response
        throw new GenerateFailureException('No response was received from the build request.');
    }
    else if (responseBody.message ==
        'Impacted tasks not found. No impacts have been detected by build processing.') {
        console.log(utils.getStatusMessageToPrint(responseBody.message));
        return responseBody;
    }
    else if (responseBody.awaitStatus === undefined) {
        // Build did not complete - there should be a message returned
        if (responseBody.message !== undefined) {
            throw new GenerateFailureException(responseBody.message);
        }
        throw new GenerateFailureException('The build request did not complete successfully.');
    }
    else if (responseBody.awaitStatus.generateFailedCount !== 0) {
        // there were generate failures
        console.error(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
        throw new GenerateFailureException('There were build failures.');
    }
    else {
        // success
        console.log(utils.getStatusMessageToPrint(responseBody.awaitStatus.statusMsg));
        return responseBody;
    }
}
exports.handleResponseBody = handleResponseBody;
/**
 * Takes the fields from the response body and sends them to the outputs of
 * the job
 * @param {*} responseBody the response body received from the REST API request
 */
function setOutputs(responseBody) {
    if (responseBody) {
        core.setOutput('output_json', utils.convertObjectToJson(responseBody));
        core.setOutput('set_id', responseBody.setId);
        core.setOutput('url', responseBody.url);
        core.setOutput('assignment_id', responseBody.assignmentId);
        const isTimedOut = utils.stringHasContent(responseBody.message) && responseBody.message.includes('timed out');
        core.setOutput('is_timed_out', isTimedOut);
        if (responseBody.awaitStatus) {
            core.setOutput('generate_failed_count', responseBody.awaitStatus.generateFailedCount);
            core.setOutput('generate_success_count', responseBody.awaitStatus.generateSuccessCount);
            core.setOutput('has_failures', responseBody.awaitStatus.hasFailures);
            core.setOutput('task_count', responseBody.awaitStatus.taskCount);
            core.setOutput('message', responseBody.awaitStatus.statusMsg);
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
function assembleRequestBodyObject(runtimeConfig, changeType, executionStatus) {
    const requestBody = {};
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
exports.assembleRequestBodyObject = assembleRequestBodyObject;
/**
 * Gets the request path for the CES REST api ispw-await on tasks. The returned path starts with
 * '/ispw/' and ends with the query parameters
 *
 * @param buildParms The build parms to use when filling out the request url
 * @return the request path which can be appended to the CES url
 */
function getBuildAwaitUrlPath(srid, buildParms, build_automatically) {
    let tempUrlStr = `/ispw/${srid}/build-await?`;
    if (utils.stringHasContent(build_automatically)) {
        if (buildParms.taskIds && buildParms.taskIds.length > 0) {
            buildParms.taskIds.forEach(id => {
                tempUrlStr = tempUrlStr.concat(`taskId=${id}&`);
            });
        }
    }
    else {
        if (utils.stringHasContent(buildParms.containerId) ||
            (utils.stringHasContent(buildParms.containerId) && utils.stringHasContent(buildParms.taskIds))) {
            tempUrlStr = tempUrlStr.concat(`assignmentId=${buildParms.containerId}&`);
            tempUrlStr = tempUrlStr.concat(`level=${buildParms.taskLevel}&`);
        }
        else {
            if (buildParms.taskIds && buildParms.taskIds.length > 0) {
                buildParms.taskIds.forEach(id => {
                    tempUrlStr = tempUrlStr.concat(`taskId=${id}&`);
                });
            }
        }
    }
    tempUrlStr = tempUrlStr.slice(0, -1);
    return tempUrlStr;
}
exports.getBuildAwaitUrlPath = getBuildAwaitUrlPath;
/**
 * Checks which authentication method is used in workflow i.e. token or certi
 * @param  {string} cesToken the ces_token for authentication
 * @param  {string} certificate the certificate passed for authentication
 * @return {boolean} which authentication is passed in workflow i.e token or certi
 * true for token
 * false for certi
 */
function isAuthTokenOrCerti(cesToken, certificate) {
    if (utils.stringHasContent(cesToken)) {
        return true;
    }
    else if (utils.stringHasContent(certificate)) {
        return false;
    }
    else {
        return undefined;
    }
}
exports.isAuthTokenOrCerti = isAuthTokenOrCerti;
/**
 * Error to throw when not all the arguments have been specified for the action.
 *
 * @param message the message associated with the error
 */
class MissingArgumentException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, MissingArgumentException.prototype);
        this.name = 'MissingArgumentException';
    }
}
exports.MissingArgumentException = MissingArgumentException;
/**
 * Error to throw when the response for the generate request is incomplete
 *  or indicates errors.
 *
 * @param message the message associated with the error
 */
class GenerateFailureException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, GenerateFailureException.prototype);
        this.name = 'GenerateFailureException';
    }
}
exports.GenerateFailureException = GenerateFailureException;
//# sourceMappingURL=main.js.map