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


const RepayModal = ({state, setVisible, updateOptionStats, isLoading, setIsLoading}) => {
	const option = state.option;
	const contract = option?.contract;
	const position = state.position;
	const positionReady = Object.keys(position ?? {}).length;

	const {globalStats} = useContext(GlobalStatsContext)
	const [inputVal, setInputVal] = useState('')
	const [step, setStep] = useState(0);
	const [liqPrice, setLiqPrice] = useState('—')

	let repay, available;
	if (option) {
		repay = option.realVals?.borrowLimitUsed;
	} else if (positionReady) {
		repay = Number(ethers.utils.formatUnits(position.ddl.borrowed, 6));
		available = floor(ethers.utils.formatUnits(position.delta, 30));
	}

	const setMaxVal = () => {
		setInputVal(repay)
	}

	useEffect(() => {
		if (sepToNumber(inputVal) > repay) {
			setInputVal(repay)
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
	
	useEffect(() => {
		if (positionReady) {
			DDL_GMX.currentBorderPrice(position.ddl.keyId)
				.then(res => {
					setLiqPrice(floor(res));
				});
		}
	}, [])
	
	useEffect(() => {
		setStep(state.initStep ?? 0)
	}, [state.initStep])
	

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
									setInputVal('')
									updateOptionStats(option.id, option.isETH)
								})
						},
						err => {
							console.log(err);

							if (err.message.includes('transfer amount exceeds allowance')) {
								USDC_signed.approve(contract.address, 10**9 * 1e6)
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
				} else if (positionReady) {
					DDL_GMX.repay(position.ddl.keyId, formatForContract(inputVal))
						.then(res => {
							console.log('Repay transaction:', res);

							res.wait()
								.then(() => {
									setInputVal('')
								})
						}, err => {
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
				} else if (positionReady) {
					DDL_GMX.unlock(position.ddl.keyId)
						.then(res => {
							console.log('Unlock transaction:', res);

							res.wait()
								.then(() => {
									setVisible(false)
									setStep(0)
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
		setStep(state.initStep ?? 0)
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
						<div className="modal__info-field-val">{(option ? separateThousands(option.borrowLimit) : separateThousands(available / 2)) + ' USDC'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title nowrap">Loan-To-Value:</div>
							<div className="modal__info-field-val">
								{(option ? floor((option.borrowLimitUsed / option.intrinsicValue) * 100) : '?') + '%'}
							</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Repay:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(repay) + ' USDC'}</div>
					</div>
					{
						step === 0 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className="modal__info-field-val">{separateThousands(liqPrice)}</div>
							</div>
							: ""
					}
				</div>
				<div className="modal__form-wrapper">
					{
						isLoading ?
							<Loader />
							:
							<Form maxVal={repay} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
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