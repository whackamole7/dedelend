import React from 'react';
import Modal from './Modal';
import Button from '../button/Button';
import Loader from './../loader/Loader';
import { Link } from 'react-router-dom';

const RegisterModal = ({ visible, setVisible, onRegisterClick, onApproveClick, curStep, isLoading }) => {
	const steps = [
		{
			name: 'Register',
			title: 'You need to register',
			body: <div className="modal__text">
							<p>DeDeLend will create a smart contract for your address. All trades will be opened and closed via the smart contract.</p>
							<p>After the registration you'll receive ERC-721 tokens, each token is a representation of your position on GMX:</p>
							<div className="text-cols">
								<div className="text-col">
									<p>ETH — short</p>
									<p>ETH — long</p>
								</div>
								<div className="text-col">
									<p>BTC — short</p>
									<p>BTC — long</p>
								</div>
								<div className="text-col">
									<p>UNI — short</p>
									<p>UNI — long</p>
								</div>
								<div className="text-col">
									<p>LINK — short</p>
									<p>LINK — long</p>
								</div>
							</div>
							<p>The ERC tokens allow open/close positions on GMX. Since all position on GMX is tokenized you can use them as collateral on DeDeLend.</p>
						</div>,
			btn: <Button btnActive={true} onClick={onRegisterClick}>Register</Button>,
		},
		{
			name: 'Approve',
			title: 'Approve',
			body: <div className="modal__text">
							<p>DeDeLend will create a smart contract for your address. All trades will be opened and closed via the smart contract.</p>
							<p>After the registration you'll receive ERC-721 tokens, each token is a representation of your position on GMX</p>
						</div>,
			btn: <Button btnActive={true} onClick={onApproveClick}>Approve</Button>,
		},
	]

	const step = steps[curStep];
	
	return (
		<Modal isObligatory={true} visible={visible} setVisible={setVisible} className="modal_register">
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
				<ul className="modal__list modal__text">
					<li><span>To use GMX position as collateral you need to register.</span></li>
					{/* <li><span>For using Hegic Options you don't need to register, so just click <Link className='inline-link' to="/options">here.</Link></span></li> */}
				</ul>
				{step.body}
				{isLoading ? <Loader /> : step.btn}
			</div>
		</Modal>
	);
};

export default RegisterModal;