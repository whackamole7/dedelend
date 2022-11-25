import React from 'react';

const Wallet = ({ address }) => {
	return (
		<div className="wallet-container">
			<a href={"https://arbiscan.io/address/" + address} target="_blank" className="wallet">
				<div className="wallet__avatar-wrapper">
					<div className="wallet__avatar">
						{/* <img src="./img/1.jpg" alt="Wallet Avatar" /> */}
					</div>
				</div>
				<div className="wallet__address">
					{window.outerWidth < 992 ?
						address.substr(0,5) + '...' + address.substr(-4)
						: address}
				</div>
			</a>
		</div>
	);
};

export default Wallet;