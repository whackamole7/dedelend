import { ethers } from "ethers"
import { USDC, Pool } from './contracts';
import { floor } from './math';
import { APY } from './constants'


export const getGlobalStats = async () => {
	const globalStats = {}
	
	const totalBalance = (await Pool.getTotalBalance()).toNumber();
	
	const totalLocked = (await Pool.totalLocked()).toNumber();
	const totalSupplied = totalBalance + totalLocked;
	globalStats.totalSupplied = Math.round(ethers.utils.formatUnits(totalSupplied, 6));
	globalStats.availToBorrow = Math.round(ethers.utils.formatUnits(totalBalance, 6));
	globalStats.totalBorrowed = Math.round(ethers.utils.formatUnits(totalLocked, 6));
	
	globalStats.utilRate = floor(totalSupplied === 0 ? 
		0 : (totalLocked / totalSupplied * 100));
	globalStats.borrowAPY = APY;
	
	
	return globalStats;
}

export const getUserStats = async (walletAddress) => {
	try {
		const balance = Number(ethers.utils.formatUnits(await USDC.balanceOf(walletAddress), 6));
		const curBalance = Number(ethers.utils.formatUnits(await Pool.getUserBalance(walletAddress), 6));
	
		const totalBalance = (await Pool.getTotalBalance()).toNumber();
		const avail = Math.min(curBalance, totalBalance);
	
		const userStats = {
			balance: floor(balance),
			curBalance: floor(curBalance),
			avail: floor(avail),
		};
	
		return userStats;
	} catch(err) {
		console.log(err);
	}
	
}
