import React from 'react';

const Wallet = ({ address }) => {
	return (
		<div className="wallet-container">
			<div className="wallet">
				<div className="wallet__avatar-wrapper">
					<div className="wallet__avatar">
						{/* <img src="./img/1.jpg" alt="Wallet Avatar" /> */}
					</div>
				</div>
				<div className="wallet__address">
					{window.outerWidth < 768 ?
						address.substr(0,5) + '...' + address.substr(-4)
						: address}
				</div>
			</div>
			<button className="logout-btn" onClick={() => {
				
			}}></button>
		</div>
	);
};

export default Wallet;