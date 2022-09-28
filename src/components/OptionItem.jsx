import React, { useState } from 'react';
import Button from './UI/button/Button';
import { OptManager } from './utils/contracts';
import { separateThousands } from './utils/sepThousands';

const OptionItem = ({ option, stats, ...props }) => {
	const [initBorrowStep, setInitBorrowStep] = useState(0)
	const [initRepayStep, setInitRepayStep] = useState(0)
	const [repayDisabled, setRepayDisabled] = useState(true);

	const contract = option.contracts?.[0]
	

	if (typeof option === 'string') {
		return(
			<div className='borrow-market__warning'>
				{option}
			</div>
		)
	}
	
	OptManager.isApprovedOrOwner(contract.address, option.id)
		.then(res => {
			if (res === true) {
				OptManager.ownerOf(option.id)
					.then(owner => {
						if (owner == contract.address) {
							setInitBorrowStep(2)
							setRepayDisabled(false)

							if (option.borrowLimitUsed <= 0) {
								setInitRepayStep(1)
							} else {
								setInitRepayStep(0)
							}
							
						} else {
							setInitBorrowStep(1)
							setRepayDisabled(true)
						}
					})
				
			} else {
				setInitBorrowStep(0)
				setInitRepayStep(0)
				setRepayDisabled(true)
			}
		})

	

	return (
		<div className="borrow-market__item _mobile-fluid" key={option.id}>
			<div className="borrow-market__item-options">
				{
					Object.keys(option).map((key, i) => {
						const stat = stats[i] ?? '';
						if (!stat) {
							return;
						}
						
						let val = '';
						if (typeof stat.unit !== 'function') {
							if (option[key] !== '') {
								let convertedNum;
								if (stat.name === 'ID' || stat.name === 'Option') {
									convertedNum = option[key]
								} else {
									convertedNum = separateThousands(option[key]);
								}
								
								val = stat.unit === '$' ? stat.unit + convertedNum
								: convertedNum + ' ' + stat.unit;
							} else {
								val = '—'
							}
							
						} else {
							val = stat.unit(option[key])
						}

						return(
							<div className="borrow-market__item-option" key={key}>
								<div className="borrow-market__item-option-name">
									{stat.name}
								</div>
								<div className="borrow-market__item-option-val">
									{val}
								</div>
							</div>
						)
					})
				}
			</div>

			<div className="borrow-market__item-btns btns">
				<Button className={'btn_small'} disabled={
					(option.borrowLimit <= 0
						|| option.borrowLimitUsed >= option.borrowLimit
						|| option.expiration <= 60 * 60 * 1000)
				} onClick={() => {
					props.setBorrowModalState({
						...props.borrowModalState,
						isVisible: true,
						option,
						initStep: initBorrowStep
					})
				}}>Borrow</Button>
				<Button className={"btn_small"} disabled={
					repayDisabled
				} onClick={() => {
					props.setRepayModalState({
						...props.repayModalState,
						isVisible: true,
						option,
						initStep: initRepayStep
					})
				}}>Repay</Button>
			</div>
		</div>
	);
};

export default OptionItem;