import React, { useContext, useState, useEffect } from 'react';
import { UserStatsContext } from './../context/context';
import Form from './Form';
import { DDL_POOL, DDL_POOL_signed, USDC_signed } from './utils/contracts';
import { separateThousands } from './utils/sepThousands';
import Loader from './UI/loader/Loader';
import { getUserStats } from './utils/stats';

const SupplyCard = ({ step, setStep, ...props }) => {
	const {userStats, setUserStats} = useContext(UserStatsContext)
	const [inputVal, setInputVal] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const steps = [
		{
			title: "Approve",
			onSubmit: (e) => {
				e.preventDefault();
				setIsLoading(true)
				try {
					USDC_signed.approve(DDL_POOL.address, (10**9 * 1e6).toFixed(0))
					.then(tsc => {
						console.log('Supply Approve transaction: ', tsc);
						
						tsc.wait()
							.then(() => {
								setStep(step + 1)
								setIsLoading(false)
							})
					},
					err => {
						console.log(err)

						setIsLoading(false)
					})
				} catch(e) {
					console.log(e);
					setIsLoading(false)
				}
				
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: true,
			},
			btnIsActive: true
		},
		{
			title: "Supply",
			onSubmit: (e) => {
				e.preventDefault()
				setIsLoading(true)
				try {
					DDL_POOL_signed.provideFrom(props.walletAddress, inputVal * 1e6, 0)
					.then(tsc => {
						console.log('Supply transaction:', tsc);

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
				
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: false,
				state: {
					val: inputVal,
					setVal: setInputVal
				}
			}
		}
	]
	
	return (
		<div className={"supply-card market-card app-box " + props.className}>
			<h2>Supply USDC</h2>
			<div className="steps">
				{steps.map((el, i) => {
					return (
						<div className={i === step ? 'step current' : 'step'} key={i}>
							{el.title}
						</div>
					)
				})}
			</div>
			{
				isLoading ?
					<Loader />
					:
					<Form className="market-card__form" maxVal={userStats.balance} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
					isStep={step < steps.length - 1}
					btnIsActive={steps[step].btnIsActive}
					btnIsDisabled={userStats.balance <= 0 || userStats.balance === undefined || props.walletAddress === ''}></Form>
			}
			
			<div className="market-card__info">
				<div className="info-field">
					<div className="info-field__name">Balance: </div>
					<div className={"info-field__val" + (userStats.balance !== undefined ? '' : ' no-data')}>{userStats.balance !== undefined ? (separateThousands(userStats.balance) + ' USDC') : ''}</div>
				</div>
			</div>
		</div>
	);
};

export default SupplyCard;