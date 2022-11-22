import React, { useEffect, useState } from 'react';
import AttentionBox from './../Common/AttentionBox';
import Button from './../../../../components/UI/button/Button';
import { getDgContract, DDL_AccountManager } from '../../../../components/utils/contracts';
import { ethers } from 'ethers';

const ReturnFundsBox = ({ dgAddress, tokenAddresses }) => {
	const [keyId, setKeyId] = useState(null);

	useEffect(() => {
		if (!dgAddress) {
			return;
		}
		
		const DG = getDgContract(dgAddress)
		DG.keyByIndexToken(ethers.constants.AddressZero, true)
			.then(setKeyId)
	}, [dgAddress])

	const returnFunds = () => {
		if (!keyId) {
			return;
		}

		tokenAddresses?.forEach(address => {
			DDL_AccountManager.withdrawLiquidity(keyId.toNumber(), address)
				.then(console.log)
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