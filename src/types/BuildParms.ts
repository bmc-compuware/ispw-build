import { BuildAuto } from "./BuildAuto";

export interface BuildParms {
    ces_url: string,
    ces_token: string,
    srid: string,
    runtime_configuration: string,
    build_automatically?: BuildAuto,
    application?: string,
    assignment_id?: string,
    level?: string,
    mname?: string,
    mtype?: string,
    //task_id?: string,
    change_type?: string,
    execution_status?: string
}
