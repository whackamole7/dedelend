import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { USDC_signed } from '../../utils/contracts';
import Loader from './../loader/Loader';
import { sepToNumber } from './../../utils/sepThousands';
import { floor } from './../../utils/math';


const RepayModal = ({state, setVisible, updateOptionStats, isLoading, setIsLoading}) => {
	const option = state.option;
	const contract_signed = option.contracts?.[1]

	const {globalStats} = useContext(GlobalStatsContext)
	const [inputVal, setInputVal] = useState('')
	const [step, setStep] = useState(0);
	const [liqPrice, setLiqPrice] = useState('—')

	const repay = option.realVals?.borrowLimitUsed;

	const setMaxVal = () => {
		setInputVal(repay)
	}

	useEffect(() => {
		if (typeof option !== 'object' || !Object.keys(option).length) {
			return;
		}

		if (inputVal > repay) {
			setInputVal(repay)
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

		setLiqPrice(floor(result))

	}, [inputVal])
	
	useEffect(() => {
		setStep(state.initStep ?? 0)
	}, [state.initStep])
	

	const steps = [
		{
			title: "Repay",
			onSubmit: (e) => {
				e.preventDefault();
				
				setIsLoading(true);
				contract_signed.repay(option.id, inputVal * 1e6)
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
							
							USDC_signed.approve(contract_signed.address, 10**9 * 1e6)
							.then(res => {
								res.wait()
									.then(() => {
										contract_signed.repay(option.id, inputVal * 1e6)
											.then(res => {
												res.wait()
													.then(() => {
														setInputVal('')
														updateOptionStats(option.id, option.isETH)
													})
											},
											err => {
												console.log(err);
												setIsLoading(false)
											})
										
									})
								
							}, err => {
								console.log(err);
								setIsLoading(false)
							})
						} else {
							setIsLoading(false)
						}
						
						
					})
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

				contract_signed.unlock(option.id)
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
						console.log(err);
						setIsLoading(false)
					})
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
						<div className="modal__info-field-val">{globalStats.borrowAPY + '%'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow Limit:</div>
						<div className="modal__info-field-val">{option.borrowLimit + ' USDC'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow Limit Used:</div>
						<div className="modal__info-field-val">
							{option.borrowLimitUsed + ' USDC'}
							<div className="modal__info-field-val_minor">{(option.borrowLimitUsed / option.borrowLimit * 100).toFixed(2) + '%'}</div>
						</div>
						
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Repay:</div>
						<div className="modal__info-field-val highlighted">{option.borrowLimitUsed + ' USDC'}</div>
					</div>
					{
						step === 0 ?
							<div className="modal__info-field modal__info-field_hl">
								<div className="modal__info-field-title">Liquidation Price:</div>
								<div className="modal__info-field-val">{liqPrice}</div>
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