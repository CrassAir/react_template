export interface IAuth {
    username: string
    password: string
    source: string
}

export interface IAccessModel {
    id: number
    name: string
    name_plural: string
}

export interface IRole {
    id: number
    name: string
    edit: IAccessModel[]
    read: IAccessModel[]
}

export interface IAccount {
    id: number
    username: string
    full_name: string
    organization_name: string
    team_name: string
    job_title: string
    is_superuser: boolean
    role: IRole
}

export interface IAuthResponse {
    key: string
    user: IAccount
}