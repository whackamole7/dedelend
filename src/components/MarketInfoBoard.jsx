import React, { useContext } from 'react';
import { GlobalStatsContext, UserStatsContext } from './../context/context';
import { separateThousands } from './utils/sepThousands';


const MarketInfoBoard = () => {
	const {globalStats} = useContext(GlobalStatsContext)


	return (
		<div className="info-board app-box block _mobile-fluid">
			<div className="info-board__items">
				<div className="info-board__item">
					<div className="info-board__item-title">Total Supplied</div>
					<div className="info-board__item-val">{separateThousands(globalStats.totalSupplied, ',') + ' USDC'}</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Total Borrowed</div>
					<div className="info-board__item-val">{separateThousands(globalStats.totalBorrowed, ',') + ' USDC'}</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Utilization Rate</div>
					<div className="info-board__item-val">{separateThousands(globalStats.utilRate, ',') + '%'}</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Available to Borrow</div>
					<div className="info-board__item-val">{separateThousands(globalStats.availToBorrow, ',') + ' USDC'}</div>
				</div>
				<div className="info-board__item">
					<div className="info-board__item-title">Supply APY</div>
					<div className="info-board__item-val">{separateThousands(globalStats.borrowAPY, ',') + '%'}</div>
				</div>
			</div>
		</div>
	);
};

export default MarketInfoBoard;