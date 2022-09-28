import { sepToNumber } from "./sepThousands";

export const floor = (num, decimals = 2) => {
	return Math.floor(num * 10**decimals) / 10**decimals;
}


export const formatForContract = (val, decimals = 6) => {
	return Math.floor(sepToNumber(val) * 10**decimals);
}