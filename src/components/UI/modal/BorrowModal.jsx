import React, {useContext, useState, useEffect} from 'react';
import Modal from './Modal';
import { GlobalStatsContext } from './../../../context/context';
import Form from './../../Form';
import { OptManager } from './../../utils/contracts';
import Loader from './../loader/Loader';
import { floor, formatForContract } from './../../utils/math';
import { sepToNumber, separateThousands } from './../../utils/sepThousands';

const BorrowModal = ({state, setVisible, updateOptionStats, isLoading, setIsLoading}) => {
	const option = state.option;
	const contract = option.contracts?.[0]
	const contract_signed = option.contracts?.[1]
	
	const {globalStats} = useContext(GlobalStatsContext)
	const [step, setStep] = useState(state.initStep ?? 0);
	const [inputVal, setInputVal] = useState('')
	const [liqPrice, setLiqPrice] = useState('—')

	const available = floor(option.realVals?.borrowLimit - option.realVals?.borrowLimitUsed, 6);

	const setMaxVal = () => {
		setInputVal(available)
	}

	useEffect(() => {
		if (typeof option !== 'object' || !Object.keys(option).length) {
			return;
		}

		if (sepToNumber(inputVal) > available) {
			setInputVal(available)
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
				
				OptManager.approve(contract.address, option.id)
					.then(res => {
						console.log('Approve transaction:', res);
						
						res.wait()
							.then(() => {
								setStep(step + 1);
								updateOptionStats(option.id, option.isETH)
							})
					},
					err => {
						console.log(err);
						alert(err.code + '\n' + err.reason)
						setIsLoading(false)
					})
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
				
				contract_signed.lockOption(option.id)
					.then(res => {
						console.log('Lock Collateral transaction:', res);
						
						res.wait()
							.then(() => {
								setStep(step + 1);
								updateOptionStats(option.id, option.isETH)
							})
					},
					err => {
						console.log(err);
						alert(err.code + '\n' + err.reason)
						setIsLoading(false)
					})
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

				contract_signed.borrow(option.id, formatForContract(inputVal))
					.then(res => {
						console.log('Borrow transaction:', res);
						
						res.wait()
							.then(() => {
								setInputVal('')
								updateOptionStats(option.id, option.isETH)
							})
					},
					err => {
						alert(err.code + '\n' + err.reason)
						setIsLoading(false)
					})
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
						<div className="modal__info-field-val">{globalStats.borrowAPY + '%'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Borrow Limit:</div>
						<div className="modal__info-field-val">{separateThousands(option.borrowLimit) + ' USDC'}</div>
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title nowrap">Loan-To-Value:</div>
						<div className="modal__info-field-val">
							{floor((option.borrowLimitUsed / option.intrinsicValue) * 100) + '%'}
						</div>
						
					</div>
					<div className="modal__info-field">
						<div className="modal__info-field-title">Available:</div>
						<div className="modal__info-field-val highlighted">{separateThousands(floor(available)) + ' USDC'}</div>
					</div>
					{
						step === 2 ?
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
							<Form maxVal={available} inputProps={steps[step].inputProps} btnText={steps[step].title} onSubmit={steps[step].onSubmit}
							modalVisible={state.isVisible}
							btnIsActive={steps[step].btnIsActive}
							maxWarningMsg={'Limit is exceed'}
							isModal={true}
							maxOnClick={setMaxVal}></Form>
					}
				</div>
			</div>
			<div className="modal__tip">
				You have 30 minutes before the option expires to get your option back. 30 minutes before the expiration date DeDeLend will exercise this option and take 100% of the payoff from the option.
			</div>
		</Modal>
	);
};

export default BorrowModal;