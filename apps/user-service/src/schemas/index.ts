import createUserSchema from "./basic/createUser.schema.js";
import getCurrentUserSchema from "./me/getCurrentUser.schema.js";
import getUserByIdSchema from "./basic/getUserById.schema.js";
import updateUserStatusSchema from "./me/updateStatus.schema.js";
import updateUserSchema from "./me/updateUser.schema.js";
import getUserStatusSchema from "./basic/getUserStatus.schema.js";
import deleteUserSchema from "./me/deleteUser.schema.js";
import getUserByNameSchema from "./basic/getUserByName.schema.js";
import searchUserSchema from "./basic/searchUser.schema.js";
import deleteAvatarSchema from "./avatar/deleteAvatar.schema.js";
import updateAvatarSchema from "./avatar/updateAvatar.schema.js";

export const basic = {
	createUser: createUserSchema,
	getUserById: getUserByIdSchema,
	getUserStatus: getUserStatusSchema,
	getUserByName: getUserByNameSchema,
	searchUser: searchUserSchema
};

export const me = {
	getCurrentUser: getCurrentUserSchema,
	updateUser: updateUserSchema,
	updateUserStatus: updateUserStatusSchema,
	deleteUser: deleteUserSchema
};

export const avatar = {
	deleteAvatar: deleteAvatarSchema,
	updateAvatar: updateAvatarSchema
};
