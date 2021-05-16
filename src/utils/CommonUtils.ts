/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

import _ from 'lodash';
/**
 * Test if the input value is blank
 * 
 * @param value the value to be tested
 */
export function isBlank(value: any): boolean {
    let newValue = value;

    if (_.isString(value)) {
        newValue = _.trim(value);
    }

    return _.isEmpty(newValue) && !_.isNumber(newValue) || _.isNaN(newValue);
}

/**
 * Test if the input value is not blank
 * 
 * @param value the value to be tested
 */
export function isNotBlank(value: any): boolean {
    return !isBlank(value);
}

/**
 * Adds escaped quotation marks around the given string
 * @param value a string to add quotes around
 */
export function escapeString(value: any): string {
    const escapedString: string = '"' + (value || '') + '"';
    return escapedString;
}


