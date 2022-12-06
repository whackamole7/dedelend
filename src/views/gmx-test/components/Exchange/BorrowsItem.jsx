import React from 'react';
import Tooltip from './../Tooltip/Tooltip';
import { formatAmount } from '../../lib/legacy';
import { ImSpinner2 } from 'react-icons/im';
import { t } from '@lingui/macro';
import { USD_DECIMALS, INCREASE } from './../../lib/legacy';
import StatsTooltipRow from '../StatsTooltip/StatsTooltipRow';
import { floor } from './../../../../components/utils/math';
import CollateralLocked from './CollateralLocked';
import { getDgContract } from '../../../../components/utils/contracts';
import { DDL_GMX } from './../../../../components/utils/contracts';
import { useState, useEffect } from 'react';
import { BigNumber } from 'ethers';

const BorrowsItem = (props) => {
	const {
		position,
		onPositionClick,
		setListSection,
		positionOrders,
		showPnlAfterFees,
		hasPositionProfit,
		positionDelta,
		borrowPosition,
		repayPosition,
		hasOrderError,
		liquidationPrice,
		cx,
		dgAddress,
		isLarge,
	} = props;

	const [borrowed, setBorrowed] = useState(null);
	useEffect(() => {
		// Key id for positions
		const DG = getDgContract(dgAddress);
		if (!DG) {
			return
		}
		DG.keyByIndexToken(position.indexToken.address, position.isLong)
			.then(id => {
				position.ddl.keyId = id;

				DDL_GMX.borrowedByCollateral(id)
					.then(res => {
						position.ddl.borrowed = res.borrowed;
						setBorrowed(res.borrowed)
					})
			})
	}, [dgAddress])

	

	return (
		<tr>
			<td className="clickable" onClick={() => onPositionClick(position)}>
				<div className="Exchange-list-title">
					{position.indexToken.symbol}
					{position.hasPendingChanges && <ImSpinner2 className="spin position-loading-icon" />}
				</div>
				<div className="Exchange-list-info-label">
					{position.leverage && (
						<span className="muted">{formatAmount(position.leverage, 4, 2, true)}x&nbsp;</span>
					)}
					<span className={cx({ positive: position.isLong, negative: !position.isLong })}>
						{position.isLong ? "Long" : "Short"}
					</span>
				</div>
			</td>
			<td>
				<div>
					{!position.netValue && "Opening..."}
					{position.netValue && (
						<Tooltip
							handle={`$${formatAmount(position.netValue, USD_DECIMALS, 2, true)}`}
							position="left-bottom"
							handleClassName="plain"
							renderContent={() => {
								return (
									<>
										Net Value:{" "}
										{showPnlAfterFees
											? t`Initial Collateral - Fees + PnL`
											: t`Initial Collateral - Borrow Fee + PnL`}
										<br />
										<br />
										<StatsTooltipRow
											label={t`Initial Collateralt`}
											value={formatAmount(position.collateral, USD_DECIMALS, 2, true)}
										/>
										<StatsTooltipRow label={`PnL`} value={position.deltaBeforeFeesStr} showDollar={false} />
										<StatsTooltipRow
											label={t`Borrow Fee`}
											value={formatAmount(position.fundingFee, USD_DECIMALS, 2, true)}
										/>
										<StatsTooltipRow
											label={`Open + Close fee`}
											value={formatAmount(position.positionFee, USD_DECIMALS, 2, true)}
										/>
										<StatsTooltipRow
											label={`PnL After Fees`}
											value={`${position.deltaAfterFeesStr} (${position.deltaAfterFeesPercentageStr})`}
											showDollar={false}
										/>
									</>
								);
							}}
						/>
					)}
				</div>
				{position.deltaStr && (
					<div
						className={cx("Exchange-list-info-label", {
							positive: hasPositionProfit && positionDelta.gt(0),
							negative: !hasPositionProfit && positionDelta.gt(0),
							muted: positionDelta.eq(0),
						})}
					>
						{position.deltaStr} ({position.deltaPercentageStr})
					</div>
				)}
			</td>
			<td>
				<div>${floor(position.ddl.available)}</div>
				{positionOrders.length > 0 && (
					<div onClick={() => setListSection && setListSection("Orders")}>
						<Tooltip
							handle={`Orders (${positionOrders.length})`}
							position="left-bottom"
							handleClassName={cx(
								["Exchange-list-info-label", "Exchange-position-list-orders", "plain", "clickable"],
								{ muted: !hasOrderError, negative: hasOrderError }
							)}
							renderContent={() => {
								return (
									<>
										<strong>Active Orders</strong>
										{positionOrders.map((order) => {
											return (
												<div
													key={`${order.isLong}-${order.type}-${order.index}`}
													className="Position-list-order"
												>
													{order.triggerAboveThreshold ? ">" : "<"}{" "}
													{formatAmount(order.triggerPrice, 30, 2, true)}:
													{order.type === INCREASE ? " +" : " -"}${formatAmount(order.sizeDelta, 30, 2, true)}
													{order.error && (
														<>
															, <span className="negative">{order.error}</span>
														</>
													)}
												</div>
											);
										})}
									</>
								);
							}}
						/>
					</div>
				)}
			</td>
			<td>
				${borrowed ? formatAmount(borrowed, USD_DECIMALS, 2, true) : '...'}
			</td>
			<td className="" onClick={() => {
				// onPositionClick(position)
				return;
			}}>
				<Tooltip
					handle={`$${formatAmount(position.markPrice, USD_DECIMALS, 2, true)}`}
					position="left-bottom"
					handleClassName="plain"
					renderContent={() => {
						return (
							<div>
								Click on a row to select the position's market, then use the swap box to increase your
								position size if needed.
								<br />
								<br />
								Use the "Close" button to reduce your position size, or to set stop-loss / take-profit orders.
							</div>
						);
					}}
				/>
			</td>
			<td className="" onClick={() => {
				// onPositionClick(position)
				return;
			}}>
				${formatAmount(liquidationPrice, USD_DECIMALS, 2, true)}
			</td>
			<td className="" onClick={() => {
				// onPositionClick(position)
				return;
			}}>
				{'13.3%'}
			</td>

			<td className="td-btn">
				<button
					className="Exchange-list-action"
					onClick={() => borrowPosition(position)}
					disabled={position.hasProfit}
				>
					Borrow
				</button>
			</td>
			<td className="td-btn">
				<button
					className="Exchange-list-action"
					onClick={() => repayPosition(position)}
					disabled={!position.ddl.borrowed?.gt(0)}
				>
					Repay
				</button>
				{/* <PositionDropdown
					handleEditCollateral={() => {
						editPosition(position);
					}}
					handleShare={() => {
						setPositionToShare(position);
						setIsPositionShareModalOpen(true);
					}}
					handleMarketSelect={() => {
						onPositionClick(position);
					}}
				/> */}
			</td>
			<td className="td-btn">
				{position.ddl.borrowed?.gt(0) &&
					<CollateralLocked />}
			</td>
		</tr>
	);
};

export default BorrowsItem;