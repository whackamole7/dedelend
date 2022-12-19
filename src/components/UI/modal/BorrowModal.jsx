import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { OptManager, DDL_GMX, DDL_AccountManagerToken } from './../../utils/contracts';
import Loader from './../loader/Loader';
import { floor, formatForContract } from './../../utils/math';
import { sepToNumber, separateThousands } from './../../utils/sepThousands';
import { errAlert } from '../../utils/notifications';
import { USD_DECIMALS } from './../../../views/gmx-test/lib/legacy';
import { notifySuccess } from './../../utils/notifications';

const BorrowModal = (props) => {
	const {
		state, 
		setVisible, 
		isLoading, 
		setIsLoading,
		updateOptionStats,
	} = props;
	
	const option = state.option;
	const contract = option?.contract;
	const position = state.position;

	
	const {globalStats} = useContext(GlobalStatsContext);
	const [step, setStep] = [state.step ?? 0, state.setStep];
	const [inputVal, setInputVal] = useState('');
	const [liqPrice, setLiqPrice] = useState(null);
	const [positionStats, setPositionStats] = useState({});
	const [borrowed, setBorrowed] = useState(null);

	useEffect(() => {
		if (position) {
			if (!Object.keys(position).length) {
				return;
			}

			DDL_GMX.borrowedByCollateral(position.ddl.keyId)
				.then(res => {
					setBorrowed(res.borrowed / 10**6);
				})
		}
	}, [state, isLoading]);
	

	useEffect(() => {
		if (sepToNumber(inputVal) > 0 && sepToNumber(inputVal) > (option ? available : positionStats.available)) {
			setInputVal(option ? available : positionStats.available);
		}

		if (option) {
			if (typeof option !== 'object' || !Object.keys(option).length) {
				return;
			}

			let classic, result;
			const prior = option.priorLiqPrice;
			const val = sepToNumber(inputVal);
	
			const isCALL = option.name.includes('CALL')
	
			if (isCALL) {
				classic = option.strike + (((option.borrowLimitUsed + val) / option.amount) * 1.2)
				
				result = Math.max(prior, classic);
			} else {
				classic = option.strike - (((option.borrowLimitUsed + val) / option.amount) * 1.2)
	
				result = Math.min(prior, classic);
			}
			
			setLiqPrice(floor(result))
		} else if (position) {
			if (!Object.keys(position).length) {
				return;
			}
			
			const borrowLimit = (position.hasProfit ? (position.delta / 10**USD_DECIMALS) : 0) / 2;
			const available = Math.max(borrowLimit - borrowed, 0);

			// Loan-To-Value
			const input = sepToNumber(inputVal ?? 0);
			const loanToValue = borrowLimit !== 0 ? ((borrowed + input) / borrowLimit) : 0;

			// Liq.Price
			let liqPrice;
			const size = position.size / 10**30;
			const entryPrice = position.averagePrice / 10**30;
			const amount = size / entryPrice;
			if (position.isLong) {
				liqPrice = entryPrice + ((amount / (borrowed + input)) * 1.2);
			} else {
				liqPrice = entryPrice - ((amount / (borrowed + input)) * 1.2);
			}

			if (!isFinite(liqPrice) || isNaN(liqPrice)) {
				setLiqPrice(null);
			} else {
				setLiqPrice(liqPrice);
			}

			setPositionStats({
				borrowLimit,
				available,
				loanToValue: Math.min(loanToValue, 1),
			});
		}
	}, [state, borrowed, inputVal]);

	let available;
	if (option) {
		available = floor(option.realVals?.borrowLimit - option.realVals?.borrowLimitUsed, 6);
	}

	const setMaxVal = () => {
		setInputVal(option ? available : positionStats.available);
	}

	const steps = [
		{
			title: "Approve",
			onSubmit: (e) => {
				e.preventDefault();
				setIsLoading(true);
				
				if (option) {
					OptManager.approve(contract.address, option.id)
						.then(res => {
							console.log('Approve transaction:', res);
							
							res.wait()
								.then(() => {
									setStep(step + 1);
									updateOptionStats(option.id, option.isETH);
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				} else if (position) {
					// setStep(step + 1);
					// setIsLoading(false);

					DDL_AccountManagerToken.approve(DDL_GMX.address, position.ddl.keyId)
						.then(res => {
							console.log('Approve transaction:', res);
							
							res.wait()
								.then(() => {
									setStep(step + 1);
									setIsLoading(false);
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				}
				
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: true,
			},
			btnIsActive: true,
		},
		{
			title: "Lock Collateral",
			onSubmit: (e) => {
				e.preventDefault();
				setIsLoading(true);

				if (option) {
					contract.lockOption(option.id)
						.then(res => {
							console.log('Lock Collateral transaction:', res);
							
							res.wait()
								.then(() => {
									setStep(step + 1);
									updateOptionStats(option.id, option.isETH)
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				} else if (position) {
					DDL_GMX.lockCollateral(position.ddl.keyId)
						.then(res => {
							console.log('Lock Collateral transaction:', res);

							res.wait()
								.then(() => {
									setStep(step + 1);
									setIsLoading(false);
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				}
			},
			inputProps: {
				placeholder: 'Amount',
				disabled: true,
			},
			btnIsActive: true,
		},
		{
			title: "Borrow",
			onSubmit: (e) => {
				e.preventDefault()
				setIsLoading(true);

				if (option) {
					contract.borrow(option.id, formatForContract(inputVal))
						.then(res => {
							console.log('Borrow transaction:', res);
							
							res.wait()
								.then(() => {
									setInputVal('')
									updateOptionStats(option.id, option.isETH)
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				} else if (position) {
					DDL_GMX.borrow(position.ddl.keyId, formatForContract(inputVal))
						.then(res => {
							console.log('Borrow transaction:', res);
							
							res.wait()
								.then(() => {
									notifySuccess(`Borrowed ${sepToNumber(inputVal).toFixed(2)} USDC`, res.hash);
									setInputVal('');
									setIsLoading(false);
									setVisible(false);
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
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

	let tipText = '';
	if (option) {
		tipText = 'You have 30 minutes before the option expires to get your option back. 30 minutes before the expiration date DeDeLend will exercise this option and take 100% of the payoff from the option.';
	} else if (position && step === 2 && borrowed <= 0) {
		tipText = "In case of liquidation, the position's collateral and profits will be converted into USDC.";
	}

	return (
		<Modal className={'modal_borrow'} visible={state.isVisible} setVisible={setVisible}>
			<h1 className='modal__title'>Borrow USDC</h1>
			<div className="modal__body">
				<div className="modal__steps steps">
					{steps.map((el, i) => {
						return (
							<div className={i === step ? 'modal__step step current' : 'modal__step step'} key={i}>
								{el.title}
							</div>
						)
					})}
				</div>
				<div className="modal__info">
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow APY:</div>
						<div className="modal__info-field-val">{option ? (globalStats.borrowAPY + '%') : '13.33%'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow Limit:</div>
						<div className="modal__info-field-val">{(option ? separateThousands(option.borrowLimit) : separateThousands(floor(positionStats.borrowLimit))) + ' USDC'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title nowrap">Loan-To-Value:</div>
						<div className="modal__info-field-val">
							{(option ? floor((option.borrowLimitUsed / option.intrinsicValue) * 100) : (positionStats.loanToValue * 100).toFixed(2)) + '%'}
						</div>
						
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Available:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(option ? floor(available) : positionStats.available?.toFixed(2)) + ' USDC'}</div>
					</div>
					{
						step === 2 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className="modal__info-field-val">{liqPrice !== null ? `$${separateThousands(liqPrice?.toFixed(2))}` : '—'}</div>
							</div>
							: ""
					}
				</div>
				<div className="modal__form-wrapper">
					{
						isLoading ?
							<Loader />
							:
							<Form maxVal={option ? available : position.ddl?.available} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
							modalVisible={state.isVisible}
							btnIsActive={steps[step].btnIsActive}
							maxWarningMsg={'Limit is exceed'}
							isModal={true}
							maxOnClick={setMaxVal}></Form>
					}
				</div>
			</div>
			{tipText && (
				<div className="modal__tip">
					{tipText}
				</div>
			)}
		</Modal>
	);
};

export default BorrowModal;