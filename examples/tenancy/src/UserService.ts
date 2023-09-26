import {Principal} from "./AccessQuery";
import {AuthenticationError} from "@pallad/common-errors";

const users = [
	new Principal.User(1, 1),
	new Principal.User(2, 2)
]

export class UserService {
	authenticateById(id: number): Principal.User {
		const user = users.find(x => x.id === id);
		if (!user) {
			throw new AuthenticationError(`Invalid user id: ${id}`);
		}
		return user;
	}
}
