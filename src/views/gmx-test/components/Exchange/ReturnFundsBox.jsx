import React, { useEffect, useState } from 'react';
import AttentionBox from './../Common/AttentionBox';
import Button from './../../../../components/UI/button/Button';
import { getDgContract, DDL_AccountManager } from '../../../../components/utils/contracts';
import { ethers } from 'ethers';
import Loader from './../../../../components/UI/loader/Loader';
import { errAlert } from './../../../../components/utils/error';

const ReturnFundsBox = ({ dgAddress, tokenAddresses }) => {
	const [keyId, setKeyId] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

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
		setIsLoading(true);

		let i = 0;
		withdrawFunds()
		function withdrawFunds() {
			const address = tokenAddresses[i];
			if (!address) {
				setIsLoading(false);
				return;
			}
			if (address === ethers.constants.AddressZero) {
				i++;
				withdrawFunds()
			}
			
			DDL_AccountManager.withdrawLiquidity(keyId, address)
				.then(tsc => {
					console.log('Withdraw transaction:', tsc);

					i++;
					if (!tokenAddresses[i]) {
						tsc.wait().then(() => setIsLoading(false));
					} else {
						withdrawFunds();
					}
				},
				err => {
					errAlert(err)
					
					i++;
					withdrawFunds()
				})
		}
	}
	
	
	
	return (
		<AttentionBox className="ReturnFunds-box">
			<p>Your position is closed by the limit order. Your funds currently are stored in your trading account, to get your money back please click on the button below</p>
			{isLoading ? <Loader />
				: <Button 
					className={'btn_small'} 
					btnActive={true} 
					onClick={returnFunds}>Return funds</Button>
			}
		</AttentionBox>
	);
};

export default ReturnFundsBox;