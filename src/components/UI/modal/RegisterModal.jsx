import React from 'react';
import Modal from './Modal';
import Button from '../button/Button';
import Loader from './../loader/Loader';
import { Link } from 'react-router-dom';
import icon_ETH from '../../../img/icon_ETH.png';

const RegisterModal = ({ visible, setVisible, onRegisterClick, onApproveClick, curStep, isLoading }) => {
	const steps = [
		{
			name: 'Register',
			title: 'Create Trading Account',
			body: <div className="modal__text">
							<p>In order to use your GMX position as collateral, you need to create trading account. After the registration, you'll receive two ERC–721 tokens.</p>
							<p>Each token is a representation of your position on GMX:</p>
							<div className="text-cols nowrap">
								<div className="text-col">
									<div className="icon-row">
										<img src={icon_ETH} alt="ETH" />
										ETH — SHORT
									</div>
								</div>
								<div className="text-col">
									<div className="icon-row">
										<img src={icon_ETH} alt="ETH" />
										ETH — LONG
									</div>
								</div>
							</div>
							{/* <div className="text-cols">
								<div className="text-col">
									<p>ETH — SHORT</p>
									<p>ETH — LONG</p>
								</div>
								<div className="text-col">
									<p>BTC — SHORT</p>
									<p>BTC — LONG</p>
								</div>
								<div className="text-col">
									<p>UNI — SHORT</p>
									<p>UNI — LONG</p>
								</div>
								<div className="text-col">
									<p>LINK — SHORT</p>
									<p>LINK — LONG</p>
								</div>
							</div> */}
						</div>,
			btn: <Button btnActive={true} onClick={onRegisterClick}>Create Trading Account</Button>,
		},
		{
			name: 'Approve',
			title: 'Approve',
			body: <div className="modal__text">
							<p>To enable trading on GMX via your trading account, you need to allow GMX to spend funds from your address</p>
						</div>,
			btn: <Button btnActive={true} onClick={onApproveClick}>Approve</Button>,
		},
	]

	const step = steps[curStep];
	
	return (
		<Modal visible={visible} setVisible={setVisible} className="modal_register">
			<div className="modal__steps steps">
				{steps.map((el, i) => {
					return (
						<div className={curStep === i ? 'modal__step step current' : 'modal__step step'} key={i}>
							{el.name}
						</div>
					)
				})}
			</div>
			<h1 className='modal__title'>{step.title}</h1>
			<div className="modal__body">
				{/* <ul className="modal__list modal__text">
					<li><span>To use GMX position as collateral you need to register.</span></li>
					<li><span>For using Hegic Options you don't need to register, so just click <Link className='inline-link' to="/options">here.</Link></span></li>
				</ul> */}
				{step.body}
				{isLoading ? <Loader /> : step.btn}
			</div>
		</Modal>
	);
};

export default RegisterModal;