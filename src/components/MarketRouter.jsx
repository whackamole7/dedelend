import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route,	useLocation, useNavigate } from "react-router-dom";
import BorrowMarket from './../views/markets/BorrowMarket';
import SupplyMarket from './../views/markets/SupplyMarket';
import Tabs from './Tabs';
import MarketInfoBoard from './MarketInfoBoard';
import { DDL_POOL, USDC } from './utils/contracts';
import { UserStatsContext } from '../context/context';
import { ethers } from 'ethers';


const MarketRouter = ({ walletAddress, setWalletAddress}) => {
	const loc = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (loc.pathname === '/' || loc.pathname === "/app.html") {
			navigate('/borrow-market')
		}
	}, [loc.pathname])
	
	const links = [
		{
			name: 'Borrow Market',
			to: '/borrow-market',
		},
		{
			name: 'Supply Market',
			to: '/supply-market',
		},
	]
	links.find(link => {
		link.isActive = loc.pathname === link.to;
		return link.isActive;
	})


	// Supply Market state
	const {userStats} = useContext(UserStatsContext)
	const [supplyStep, setSupplyStep] = useState(0)

	useEffect(() => {
		if (walletAddress) {
			USDC.allowance(walletAddress, DDL_POOL.address)
				.then((res) => {
					if (Number(ethers.utils.formatUnits(res, 6)) >= userStats.balance) {
						setSupplyStep(1)
					} else {
						setSupplyStep(0)
					}
			})
		}
	}, [userStats.balance, walletAddress])

	
	return (
		<React.Fragment>
			<Tabs className='market-tabs' links={links}></Tabs>
			<MarketInfoBoard></MarketInfoBoard>
			<Routes>
				<Route path="/borrow-market" element={<BorrowMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} />}></Route>
				<Route path="/supply-market" element={<SupplyMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} supplyStep={supplyStep} setSupplyStep={setSupplyStep} />}></Route>
			</Routes>
		</React.Fragment>
	);
};

export default MarketRouter;