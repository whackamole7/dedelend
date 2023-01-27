import React from 'react';
import Currency from './Currency';
import Tooltip from './../views/gmx-test/components/Tooltip/Tooltip';

const MarginLevel = () => {
	return (
		<div className="App-box-border Margin-level">
			<h1>Margin level</h1>
			<div className="text-table">
				<div className="text-table__row">
					<div className="text-table__left">
						<Tooltip
							className="has-hint-tooltip nowrap"
							handle="Min. Maintenance margin"
							position="left-bottom"
							enabled={true}
							renderContent={() => {
								return (
									<div>
										The margin required to maintain your current <br />positions. If your current margin balance falls <br />below Min. Maintenance Margin, your margin <br />account will be liquidated to repay the debt
									</div>
								);
							}}
						/>
					</div>
					<div className="text-table__right">
						<Currency val={1000} />
					</div>
				</div>
				<div className="text-table__row">
					<div className="text-table__left">
						Current Margin Balance
					</div>
					<div className="text-table__right">
						<Currency val={1000} />
					</div>
				</div>
				
			</div>
			<div className="Margin-level__ruler ruler">
				<div className="ruler__body-container">
					<div className="ruler__body ruler__body_low">
						<Tooltip
							className="nowrap"
							handle="10%"
							position="left-bottom"
							enabled={true}
							renderContent={() => {
								return (
									<div>
										If the price reaches this price<br /> your loan will be liquidated
									</div>
								);
							}}
						/>
					</div>
					<div className="ruler__body ruler__body_med">
						<Tooltip
							className="nowrap"
							handle="30%"
							position="left-bottom"
							enabled={true}
							renderContent={() => {
								return (
									<div>
										If the price reaches this price<br /> your loan will be liquidated
									</div>
								);
							}}
						/>
					</div>
					<div className="ruler__body ruler__body_high"></div>
				</div>
				<div className="ruler__pointer"></div>
			</div>
		</div>
	);
};

export default MarginLevel;