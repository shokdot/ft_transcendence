import axios from "axios";

const updateStatus = async (token: string, status: "ONLINE" | "OFFLINE") => {
	try {
		const response = await axios.patch(`http://localhost:3001/api/v1/users/me/status`,
			{ status },
			{ headers: { "Content-Type": "application/json", "authorization": `Bearer ${token}` } });

		return response.data;
	} catch (error) {
		throw error;
	}
};

export default updateStatus;
