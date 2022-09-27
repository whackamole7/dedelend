export const separateThousands = (num, symb = ",") => {
	if (num.toString().includes('.')) {
		return num;
	}
	
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symb)
}


const removeNonNumeric = (num) => {
	// const decimalReg = /^\d+(\.\d{1,6})?$/g;
	
	let result = num.toString().replace(/^\./g, '').replace(/[^0-9.]/g, '').replace(/^0\d/, '')

	if (result.match(/\./g)?.length > 1) {
		result = result.replace(/\.$/, '')
	}
	
	return result;
}

export const convertInputNum = (num) => {
	if (num.match(/\./g)?.length > 0) {
		return removeNonNumeric(num);
	}
	
	return separateThousands(removeNonNumeric(num), ' ')
}


export const sepToNumber = (str, symb = ' ') => {
	if (typeof str !== 'string') {
		return str;
	}
	
	return Number(str.split(symb).join(''))
}