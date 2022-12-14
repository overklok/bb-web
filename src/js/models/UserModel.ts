import JWTAuthModel from "../core/models/JWTAuthModel";

type User = {
    id: number
}

export default class UserModel extends JWTAuthModel<User> {
    static alias = 'user';

    defaultState: User = undefined;
}