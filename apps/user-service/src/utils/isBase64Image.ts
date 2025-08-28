const isBase64Image = (url: string) => {
	const regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
	return regex.test(url);
}

export default isBase64Image;
