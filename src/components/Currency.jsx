import React from 'react';
import icon_usdc from '../img/icon-usdc.svg';
import { separateThousands } from './utils/sepThousands';

const Currency = ({ val }) => {
	return (
		<div className="currency">
			<img src={icon_usdc} alt="USDC Icon" />
			<span>{separateThousands(val)}</span>
		</div>
	);
};

export default Currency;