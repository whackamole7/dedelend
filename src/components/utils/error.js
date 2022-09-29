export const errAlert = (err) => {
	console.log(err);
	alert(`Error code: ${err.code}\nError message: ${err.reason}`)
}