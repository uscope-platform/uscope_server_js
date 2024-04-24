

export interface user_model {
    username:string,
    pw_hash:string,
    role:string
}

export interface user_login_object {
    user: string,
    password: string,
    remember_me: boolean
    login_type: "user"
}

export interface auto_login_object {
    expiry: number,
    validator: string,
    selector: string
    login_type: "automated"
}

export interface auth_response {
    access_token: string,
    login_token: auto_login_object,
    role: string
}