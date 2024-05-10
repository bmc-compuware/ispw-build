"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateFailureException = exports.MissingArgumentException = exports.isAuthTokenOrCerti = exports.getBuildAwaitUrlPath = exports.assembleRequestBodyObject = exports.handleResponseBody = exports.getParmsFromInputs = exports.run = void 0;
/**
 * ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
 * SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
 * RESPECTIVE OWNERS.
 *
 * (c) Copyright 2021 BMC Software, Inc.
 * This code is licensed under MIT license (see LICENSE.txt for details)
 */
var core = __importStar(require("@actions/core"));
var utils = require('@bmc-compuware/ispw-action-utilities');
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var keys, inputs, buildParms, requiredFields, reqPath, reqUrl, hostAndPort, host, port, reqBodyObj, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    keys = [
                        'build_automatically',
                        'task_id',
                        'ces_url',
                        'ces_token',
                        'certificate',
                        'srid',
                        'runtime_configuration',
                        'change_type',
                        'execution_status'
                    ];
                    inputs = utils.retrieveInputs(core, keys);
                    core.debug('Code Pipeline: parsed inputs: ' + utils.convertObjectToJson(inputs));
                    buildParms = void 0;
                    if (utils.stringHasContent(inputs.build_automatically)) {
                        console.log('Build parameters are being retrieved from the build_automatically input.');
                        buildParms = utils.parseStringAsJson(inputs.build_automatically);
                    }
                    else {
                        console.log('Build parameters are being retrieved from the inputs.');
                        buildParms = getParmsFromInputs(inputs.task_id);
                    }
                    core.debug('Code Pipeline: parsed buildParms: ' + utils.convertObjectToJson(buildParms));
                    requiredFields = ['taskIds'];
                    if (!utils.validateBuildParms(buildParms, requiredFields)) {
                        throw new MissingArgumentException('Inputs required for Code Pipeline Build are missing. ' + '\nSkipping the build request....');
                    }
                    reqPath = getBuildAwaitUrlPath(inputs.srid, buildParms);
                    reqUrl = utils.assembleRequestUrl(inputs.ces_url, reqPath);
                    core.debug('Code Pipeline: request url: ' + reqUrl.href);
                    hostAndPort = inputs.srid.split('-');
                    host = hostAndPort[0];
                    port = hostAndPort[1];
                    reqBodyObj = assembleRequestBodyObject(inputs.runtime_configuration, inputs.change_type, inputs.execution_status);
                    core.debug('Code Pipeline: request body: ' + utils.convertObjectToJson(reqBodyObj));
                    if (buildParms.taskIds) {
                        console.log('Starting the build process for task ' + buildParms.taskIds.toString());
                    }
                    console.log('print certi ' + inputs.certificate.toString());
                    console.log('print srid ' + inputs.srid.toString());
                    console.log('print host ' + host.toString());
                    console.log('print port ' + port.toString());
                    if (!isAuthTokenOrCerti(inputs.ces_token, inputs.certificate)) return [3 /*break*/, 2];
                    //for token
                    console.log('print for token');
                    return [4 /*yield*/, utils
                            .getHttpPostPromise(reqUrl, inputs.ces_token, reqBodyObj)
                            .then(function (response) {
                            core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data));
                            // build could have passed or failed
                            setOutputs(response.data);
                            return handleResponseBody(response.data);
                        }, function (error) {
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
                            .then(function () { return console.log('The build request completed successfully.'); }, function (error) {
                            core.debug(error.stack);
                            core.setFailed(error.message);
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    //for certi
                    console.log('print for certi flow start');
                    return [4 /*yield*/, utils
                            .getHttpPostPromiseWithCert(reqUrl, inputs.certificate, host, port, reqBodyObj)
                            .then(function (response) {
                            core.debug('Code Pipeline: received response body: ' + utils.convertObjectToJson(response.data));
                            // build could have passed or failed
                            setOutputs(response.data);
                            return handleResponseBody(response.data);
                        }, function (error) {
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
                            .then(function () { return console.log('The build request completed successfully.'); }, function (error) {
                            core.debug(error.stack);
                            core.setFailed(error.message);
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    if (error_1 instanceof MissingArgumentException) {
                        // this would occur if there was nothing to load during the sync process
                        // no need to fail the action if the generate is never attempted
                        console.log(error_1.message);
                    }
                    else {
                        core.debug(error_1.stack);
                        console.error('An error occurred while starting the build');
                        core.setFailed(error_1.message);
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
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
function getParmsFromInputs(inputTaskId) {
    var buildParms = {};
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
        var isTimedOut = utils.stringHasContent(responseBody.message) && responseBody.message.includes('timed out');
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
function assembleRequestBodyObject(runtimeConfig, changeType, executionStatus) {
    var requestBody = {};
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
function getBuildAwaitUrlPath(srid, buildParms) {
    var tempUrlStr = "/ispw/" + srid + "/build-await?";
    if (buildParms.taskIds) {
        buildParms.taskIds.forEach(function (id) {
            tempUrlStr = tempUrlStr.concat("taskId=" + id + "&");
        });
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
var MissingArgumentException = /** @class */ (function (_super) {
    __extends(MissingArgumentException, _super);
    function MissingArgumentException(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, MissingArgumentException.prototype);
        _this.name = 'MissingArgumentException';
        return _this;
    }
    return MissingArgumentException;
}(Error));
exports.MissingArgumentException = MissingArgumentException;
/**
 * Error to throw when the response for the generate request is incomplete
 *  or indicates errors.
 *
 * @param message the message associated with the error
 */
var GenerateFailureException = /** @class */ (function (_super) {
    __extends(GenerateFailureException, _super);
    function GenerateFailureException(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, GenerateFailureException.prototype);
        _this.name = 'GenerateFailureException';
        return _this;
    }
    return GenerateFailureException;
}(Error));
exports.GenerateFailureException = GenerateFailureException;
//# sourceMappingURL=main.js.map