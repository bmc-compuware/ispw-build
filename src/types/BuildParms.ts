/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC
* SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES ARE TRADEMARKS OF THEIR
* RESPECTIVE OWNERS.
*
* (c) Copyright 2021 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/
export interface BuildParms {
    ces_url: string;
    ces_token: string;
    srid: string;
    runtime_configuration?: string;
    build_automatically?: string;
    level?: string;
    task_id?: string;
    change_type?: string;
    execution_status?: string;
}
