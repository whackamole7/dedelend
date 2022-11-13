export const errAlert = (err, setIsLoading) => {
	const msg = err.reason ?? err.message;
	
	console.log(err);
	alert(`Error code: ${err.code}\nError message: ${msg}\n\nCheck the console for details.`)

	if (setIsLoading) {
		setIsLoading(false);
	}
}