import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route,	useLocation, Navigate } from "react-router-dom";
import SupplyMarket from '../views/markets/SupplyMarket';
import { UserStatsContext } from '../context/context';
import GMXInterface from '../views/gmx-test/App/App';
import { connectWallet } from './utils/wallet';
import MarginAccount from '../views/MarginAccount';
import { HOMEPAGE_HREF } from './utils/constants';
import { USDC } from './utils/contracts';
import { ethers } from 'ethers';


const AppRouter = ({ walletAddress, setWalletAddress, setRegisterVisible, account }) => {
	// Supply Market state
	const {userStats} = useContext(UserStatsContext)
	const [supplyStep, setSupplyStep] = useState(0)

	const contract = '';
	useEffect(() => {
		if (walletAddress) {
			USDC.allowance(walletAddress, contract)
				.then((res) => {
					if (Number(ethers.utils.formatUnits(res, 6)) >= userStats.balance) {
						setSupplyStep(1)
					} else {
						setSupplyStep(0)
					}
			})
		}
	}, [userStats?.balance, walletAddress]);

	
	return (
		<Routes>
			<Route path="/perpetuals" element={
				<GMXInterface
					connectWallet={() => {
						connectWallet(setWalletAddress)
					}}
					walletAddress={walletAddress}
					setRegisterVisible={setRegisterVisible} />
			} />
			<Route
				path="/earn"
				element={<SupplyMarket walletAddress={walletAddress} setWalletAddress={setWalletAddress} supplyStep={supplyStep} setSupplyStep={setSupplyStep} />} 
			/>
			<Route
				path="/account"
				element={
					<MarginAccount
						account={account}
					/>
				}
			/>
			<Route
				path="*"
				element={<Navigate to={HOMEPAGE_HREF} replace />}
			/>
		</Routes>
	);
};

export default AppRouter;