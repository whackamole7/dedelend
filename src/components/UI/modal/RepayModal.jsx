import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { USDC_signed, DDL_GMX } from '../../utils/contracts';
import Loader from './../loader/Loader';
import { sepToNumber, separateThousands } from './../../utils/sepThousands';
import { floor, formatForContract } from './../../utils/math';
import { errAlert } from './../../utils/error';
import { ethers } from "ethers";
import { formatAmount, getLiquidationPrice, USD_DECIMALS } from './../../../views/gmx-test/lib/legacy';


const RepayModal = (props) => {
	const {
		state, 
		setVisible, 
		updateOptionStats, 
		isLoading, 
		setIsLoading
	} = props;

	const option = state.option;
	const contract = option?.contract;
	const position = state.position;

	const {globalStats} = useContext(GlobalStatsContext)
	const [inputVal, setInputVal] = useState('')
	const [step, setStep] = [state.step ?? 0, state.setStep];
	const [liqPrice, setLiqPrice] = useState(null);
	const [positionStats, setPositionStats] = useState({});


	useEffect(() => {
		if (position) {
			if (!Object.keys(position).length) {
				return;
			}

			console.log('repay');

			DDL_GMX.currentBorderPrice(position.ddl.keyId)
				.then(res => {
					setLiqPrice(res);
				})
			const borrowLimit = (position.hasProfit ? ethers.utils.formatUnits(position.delta, USD_DECIMALS) : 0) / 2;

			const repay = Number(ethers.utils.formatUnits(position.ddl.borrowed, 6));
			const loanToValue = borrowLimit !== 0 ? (ethers.utils.formatUnits(position.ddl.borrowed, 6) / borrowLimit) : 0;

			setPositionStats({
				borrowLimit, 
				repay, 
				loanToValue: loanToValue > 1 ? 1 : loanToValue 
			});
		}
	}, [state]);
	
	let repay;
	if (option) {
		repay = option.realVals?.borrowLimitUsed;
	}

	const setMaxVal = () => {
		setInputVal(option ? repay : positionStats.repay)
	}

	useEffect(() => {
		if (sepToNumber(inputVal) > 0 && sepToNumber(inputVal) > (option ? repay : positionStats.repay)) {
			setInputVal(option ? repay : positionStats.repay)
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
				classic = option.strike + (((option.borrowLimitUsed - val) / option.amount) * 1.2)
				
				result = Math.max(prior, classic);
			} else {
				classic = option.strike - (((option.borrowLimitUsed - val) / option.amount) * 1.2)
	
				result = Math.min(prior, classic);
			}
	
			if (result === prior && sepToNumber(inputVal) >= repay) {
				setLiqPrice('—')
				return;
			}
	
			setLiqPrice(floor(result))
		}
	}, [inputVal])
	

	const steps = [
		{
			title: "Repay",
			onSubmit: (e) => {
				e.preventDefault();
				
				setIsLoading(true);

				if (option) {
					contract.repay(option.id, formatForContract(inputVal))
						.then(res => {
							console.log('Repay transaction:', res);

							res.wait()
								.then(() => {
									setInputVal('');
									updateOptionStats(option.id, option.isETH);
								})
						},
						err => {
							console.log(err);

							if (err.message.includes('transfer amount exceeds allowance')) {
								USDC_signed.approve(contract.address, ethers.constants.MaxUint256)
								.then(res => {
									res.wait()
										.then(() => {
											contract.repay(option.id, formatForContract(inputVal))
												.then(res => {
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
											
										})
									
								}, err => {
									errAlert(err)
									setIsLoading(false)
								})
							} else {
								errAlert(err)
								setIsLoading(false)
							}
						})
				} else if (position) {
					DDL_GMX.repay(position.ddl.keyId, formatForContract(inputVal))
						.then(res => {
							console.log('Repay transaction:', res);

							res.wait()
								.then(() => {
									setInputVal('');
									setIsLoading(false);
								})
						}, err => {
							console.log(err);
							
							if (err.message.includes('transfer amount exceeds allowance')) {
								USDC_signed.approve(DDL_GMX.address, ethers.constants.MaxUint256)
									.then(res => {
										res.wait()
											.then(() => {
												DDL_GMX.repay(position.ddl.keyId, formatForContract(inputVal))
													.then(res => {
														console.log('Repay transaction:', res);

														res.wait()
															.then(() => {
																setInputVal('');
																setIsLoading(false);
															})
													}, err => {
														errAlert(err)
														setIsLoading(false)
													})
											})
										
									}, err => {
										errAlert(err)
										setIsLoading(false)
									})
							} else {
								errAlert(err)
								setIsLoading(false)
							}
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
			},
			btnIsActive: false
		},
		{
			title: "Unlock Collateral",
			onSubmit: (e) => {
				e.preventDefault()
				setIsLoading(true);

				if (option) {
					contract.unlock(option.id)
						.then(res => {
							console.log('Unlock transaction:', res);

							res.wait()
								.then(() => {
									updateOptionStats(option.id, option.isETH, false)
									setVisible(false)
									setStep(0)
								})
						},
						err => {
							errAlert(err)
							setIsLoading(false)
						})
				} else if (position) {
					DDL_GMX.unlock(position.ddl.keyId)
						.then(res => {
							console.log('Unlock transaction:', res);

							res.wait()
								.then(() => {
									setVisible(false);
									setStep(0);
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
				disabled: true
			},
			btnIsActive: true
		}
	]

	const resetModal = () => {
		// setStep(state.initStep ?? 0)
	}

	return (
		<Modal className={'modal_borrow'} visible={state.isVisible} setVisible={setVisible} resetModal={resetModal}>
			<h1 className='modal__title'>Repay USDC</h1>
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
								{(option ? floor((option.borrowLimitUsed / option.intrinsicValue) * 100) : floor((positionStats.loanToValue) * 100)) + '%'}
							</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Repay:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(option ? repay : floor(positionStats.repay)) + ' USDC'}</div>
					</div>
					{
						step === 0 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className="modal__info-field-val">${option ? separateThousands(liqPrice) : formatAmount(liqPrice, 8, 2, true)}</div>
							</div>
							: ""
					}
				</div>
				<div className="modal__form-wrapper">
					{
						isLoading ?
							<Loader />
							:
							<Form maxVal={option ? repay : positionStats.repay} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
							isStep={step < steps.length - 1}
							modalVisible={state.isVisible}
							btnIsActive={steps[step].btnIsActive}
							maxWarningMsg={'Amount is too big'}
							isModal={true}
							maxOnClick={setMaxVal}></Form>
					}
				</div>
			</div>
		</Modal>
	);
};

export default RepayModal;