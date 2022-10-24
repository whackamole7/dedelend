import React from 'react';
import './Slippage.scss';

const SlippageInput = ({ value, setValue }) => {
	return (
		<div className="Exchange-swap-section Slippage-input-container">
			<div className="Exchange-swap-section-bottom">
				<div className="Exchange-swap-input-container">
					<input
						placeholder="Slippage (%)"
						className="Exchange-swap-input Slippage-input"
						value={value}
						onChange={(e) => {
							const val = (e.target.value).replace(/[^0-9]/g, '').replace(/^0\d/, '');
							
							if (val > 100) {
								setValue(100)
							} else if (val < 0) {
								setValue(0)
							} else {
								setValue(val)
							}
						}}
					/>
				</div>
			</div>
		</div>
	)
};

export default SlippageInput;