import React from 'react';
import AttentionBox from './../Common/AttentionBox';
import Button from './../../../../components/UI/button/Button';

const ReturnFundsBox = (props) => {
	const {
		tokenAddresses,
	} = props;
	
	const returnFunds = () => {
		tokenAddresses?.forEach(address => {

		})
	}
	
	return (
		<AttentionBox className="ReturnFunds-box">
			<p>Your position is closed by the limit order. Your funds currently are stored in your trading account, to get your money back please click on the button below</p>
			<Button 
				className={'btn_small'} 
				btnActive={true} 
				onClick={returnFunds}>Return funds</Button>
		</AttentionBox>
	);
};

export default ReturnFundsBox;