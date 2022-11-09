import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route,	useLocation, useNavigate } from "react-router-dom";
import BorrowMarket from '../views/markets/BorrowMarket';
import SupplyMarket from '../views/markets/SupplyMarket';
import Tabs from './Tabs';
import MarketInfoBoard from './MarketInfoBoard';
import { DDL_POOL, USDC } from './utils/contracts';
import { UserStatsContext } from '../context/context';
import { ethers } from 'ethers';
import GMXInterface from '../views/gmx-test/App/App';
import { connectWallet } from './utils/wallet';


const AppRouter = ({ walletAddress, setWalletAddress, dgAddress}) => {
	const loc = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (loc.pathname === '/' || loc.pathname === "/app.html") {
			navigate('/options/borrow-market')
		}
	}, [loc.pathname])
	
	const links = [
		{
			name: 'Borrow Market',
			to: '/options/borrow-market',
		},
		{
			name: 'Supply Market',
			to: '/options/supply-market',
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
		<>
			<Routes>
				<Route path="/perpetuals" element={
					<GMXInterface
						connectWallet={() => {
							connectWallet(setWalletAddress)
						}}
						walletAddress={walletAddress} 
						dgAddress={dgAddress} />
				} />
				<Route path="/options">
					<Route path="/options/borrow-market" element={
						<>
							<Tabs className='market-tabs' links={links}></Tabs>
							<MarketInfoBoard></MarketInfoBoard>
							<BorrowMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
						</>
					} />
					<Route path="/options/supply-market" element={
						<>
							<Tabs className='market-tabs' links={links}></Tabs>
							<MarketInfoBoard></MarketInfoBoard>
							<SupplyMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} supplyStep={supplyStep} setSupplyStep={setSupplyStep} />
						</>
					} />
				</Route>
			</Routes>
		</>
	);
};

export default AppRouter;