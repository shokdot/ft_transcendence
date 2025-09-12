import createUserSchema from "./basic/createUser.schema.js";
import getCurrentUserSchema from "./me/getCurrentUser.schema.js";
import getUserByIdSchema from "./basic/getUserById.schema.js";
import updateUserStatusSchema from "./me/updateStatus.schema.js";
import updateUserSchema from "./me/updateUser.schema.js";
import getUserStatusSchema from "./basic/getUserStatus.schema.js";

export const basic = {
	createUser: createUserSchema,
	getUserById: getUserByIdSchema,
	getUserStatus: getUserStatusSchema,
};

export const me = {
	getCurrentUser: getCurrentUserSchema,
	updateUser: updateUserSchema,
	updateUserStatus: updateUserStatusSchema,
};

export const avatar = {};
