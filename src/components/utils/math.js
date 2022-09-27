export const floor = (num, decimals = 2) => {
	return Math.floor(num * 10**decimals) / 10**decimals;
}