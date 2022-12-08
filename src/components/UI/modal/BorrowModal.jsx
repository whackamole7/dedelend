import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { OptManager, DDL_GMX, DDL_AccountManagerToken } from './../../utils/contracts';
import Loader from './../loader/Loader';
import { floor, formatForContract } from './../../utils/math';
import { sepToNumber, separateThousands } from './../../utils/sepThousands';
import { errAlert } from './../../utils/error';
import { ethers } from "ethers";
import { formatAmount } from '../../../views/gmx-test/lib/legacy';
import { getLiquidationPrice, USD_DECIMALS } from './../../../views/gmx-test/lib/legacy';

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
	const [step, setStep] = useState(state.initStep ?? 0);
	const [inputVal, setInputVal] = useState('');
	const [liqPrice, setLiqPrice] = useState('—');
	const [positionStats, setPositionStats] = useState({});

	useEffect(() => {
		if (position) {
			if (!Object.keys(position).length) {
				return;
			}
	
			const liqPrice = formatAmount(getLiquidationPrice(position), USD_DECIMALS, 2, true);
			const borrowLimit = (position.hasProfit ? ethers.utils.formatUnits(position.delta, USD_DECIMALS) : 0) / 2;
			const avail = borrowLimit - position.ddl.borrowed;

			setPositionStats({ liqPrice, borrowLimit, avail });
		}
	}, [state]);

	let available;
	if (option) {
		available = floor(option.realVals?.borrowLimit - option.realVals?.borrowLimitUsed, 6);
	}

	const setMaxVal = () => {
		setInputVal(option ? available : positionStats.avail);
	}

	useEffect(() => {
		if (sepToNumber(inputVal) > (option ? available : positionStats.avail)) {
			setInputVal(option ? available : positionStats.avail);
		}

		if (option) {
			if (typeof option !== 'object' || !Object.keys(option).length) {
				return;
			}

			let classic, result;
			const prior = option.priorLiqPrice;
			const val = sepToNumber(inputVal)
	
			const isCALL = option.name.includes('CALL')
	
			if (isCALL) {
				classic = option.strike + (((option.borrowLimitUsed + val) / option.amount) * 1.2)
				
				result = Math.max(prior, classic);
			} else {
				classic = option.strike - (((option.borrowLimitUsed + val) / option.amount) * 1.2)
	
				result = Math.min(prior, classic);
			}
			
			setLiqPrice(floor(result))
		}
	}, [inputVal])


	useEffect(() => {
		setStep(state.initStep ?? 0)
	}, [state.initStep])
	

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
									setInputVal('');
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
				disabled: false,
				state: {
					val: inputVal,
					setVal: setInputVal
				}
			}
		}
	]

	const resetModal = () => {
		setStep(state.initStep ?? 0)
	}

	return (
		<Modal className={'modal_borrow'} visible={state.isVisible} setVisible={setVisible} resetModal={resetModal}>
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
							{(option ? floor((option.borrowLimitUsed / option.intrinsicValue) * 100) : (positionStats.borrowLimit !== 0 ? floor(position.ddl?.borrowed / positionStats.borrowLimit) : 0)) + '%'}
						</div>
						
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Available:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(floor(option ? available : positionStats.avail)) + ' USDC'}</div>
					</div>
					{
						step === 2 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className="modal__info-field-val">${separateThousands(option ? liqPrice : positionStats.liqPrice)}</div>
							</div>
							: ""
					}
				</div>
				<div className="modal__form-wrapper">
					{
						isLoading ?
							<Loader />
							:
							<Form maxVal={option ? available : positionStats.avail} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
							modalVisible={state.isVisible}
							btnIsActive={steps[step].btnIsActive}
							maxWarningMsg={'Limit is exceed'}
							isModal={true}
							maxOnClick={setMaxVal}></Form>
					}
				</div>
			</div>
			{option &&
				(<div className="modal__tip">
					You have 30 minutes before the option expires to get your option back. 30 minutes before the expiration date DeDeLend will exercise this option and take 100% of the payoff from the option.
				</div>)}
			
		</Modal>
	);
};

export default BorrowModal;