import React, {useContext, useEffect, useState} from 'react';
import { separateThousands, sepToNumber } from './utils/sepThousands';
import { UserStatsContext } from './../context/context';
import Form from './Form';
import { DDL_POOL_signed } from './utils/contracts';
import Loader from './UI/loader/Loader';
import { getUserStats } from './utils/stats';
import { formatForContract } from './utils/math';

const WithdrawCard = (props) => {
	const {userStats, setUserStats} = useContext(UserStatsContext)
	const [inputVal, setInputVal] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	
	const inputProps = {
		placeholder: 'Amount',
		disabled: props.walletAddress === '',
		state: {
			val: inputVal,
			setVal: setInputVal
		}
	}

	useEffect(() => {
		if (sepToNumber(inputVal) > userStats.avail) {
			setInputVal(userStats.avail)
		}
	}, [inputVal])

	const onSubmit = (e) => {
		e.preventDefault()
		setIsLoading(true)
		
		try {
			DDL_POOL_signed.withdraw(formatForContract(inputVal))
			.then(tsc => {
				console.log('Withdraw transaction:', tsc);

				tsc.wait()
					.then(() => {
						getUserStats(props.walletAddress)
							.then(stats => {
								setUserStats({
									...userStats,
									...stats
								})
								setInputVal('')
								setIsLoading(false)
							})
					})
			},
			err => {
				console.log(err);
				setIsLoading(false)
			})
		} catch(err) {
			console.log(err);
		}
		
	}
	
	return (
		<div className={"withdraw-card market-card app-box " + props.className}>
			<h2>Withdraw USDC</h2>
			
			{
				isLoading ?
					<Loader />
					:
					<Form className="market-card__form" maxVal={userStats.avail} btnText={"Withdraw"} onSubmit={onSubmit} inputProps={inputProps} btnIsDisabled={userStats.avail <= 0 || userStats.avail === undefined || props.walletAddress === '' }></Form>
			}
			
			<div className="market-card__info">
				<div className="info-field">
					<div className="info-field__name">Current Balance: </div>
					<div className={"info-field__val" + (userStats.curBalance !== undefined ? '' : ' no-data')}>{userStats.curBalance !== undefined ? (separateThousands(userStats.curBalance) + ' USDC') : ''}</div>
				</div>
				<div className="info-field">
					<div className="info-field__name">Available: </div>
					<div className={"info-field__val" + (userStats.balance !== undefined ? '' : ' no-data')}>{userStats.avail !== undefined ? (separateThousands(userStats.avail) + ' USDC') : ''}</div>
				</div>
			</div>
		</div>
	);
};

export default WithdrawCard;