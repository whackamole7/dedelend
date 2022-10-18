export const errAlert = (err) => {
	const msg = err.reason ?? err.message;
	
	console.log(err);
	alert(`Error code: ${err.code}\nError message: ${msg}\n\nCheck the console for details.`)
}