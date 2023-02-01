import React, { useState, } from 'react';
import Input from './Input';
import { convertInputNum } from '../../utils/sepThousands';


const NumberInput = (props) => {
	
	return (
		<Input
			{...props}
			value={props.value}
			className={"number-input"}

			onChange={e => {
				if (props.setBtnActive) {
					props.setBtnActive(true)
				}
				props.setValue(convertInputNum(e.target.value))
			}}
			
			onBlur={() => {
				if(!props.value && props.setBtnActive) {
					props.setBtnActive(false)
				}
			}} />
	);
};

export default NumberInput;