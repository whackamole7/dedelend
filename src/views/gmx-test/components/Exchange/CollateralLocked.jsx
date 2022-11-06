import React from 'react';
import Tooltip from './../Tooltip/Tooltip';

const CollateralLocked = () => {
	return (
		<Tooltip
			className="collateral-locked-icon"
			position="right-bottom"
			enabled={true}
			handle=""
			renderContent={() => {
				return (
					<div>
						Your position is locked as collateral
					</div>
				);
			}} />
	);
};

export default CollateralLocked;