// Style
import './style/App.scss'

// Main
import React, { useState, useEffect } from 'react';

import Header from './Header';
import Footer from './Footer';
import MarketRouter from './components/MarketRouter';
import { HashRouter } from 'react-router-dom';
import { UserStatsContext } from './context/context';
import { GlobalStatsContext } from './context/context';
import Warning from './components/UI/warning/Warning';
import Favicon from 'react-favicon';
import { test } from './components/utils/contracts';



function App() {
	const [walletAddress, setWalletAddress] = useState('')
	
	const [userStats, setUserStats] = useState({
		balance: undefined,
		curBalance: undefined,
		avail: undefined
	})
	const [globalStats, setGlobalStats] = useState(
		{
			totalSupplied: "",
			totalBorrowed: "",
			utilRate: "",
			availToBorrow: "",
			borrowAPY: "",
		}
	)
	
	return (
		<React.Fragment>
			<Favicon url="https://i.imgur.com/dLCWse0.png" />
			
			<GlobalStatsContext.Provider value={{
				globalStats,
				setGlobalStats
			}}>
				<UserStatsContext.Provider value={{
					userStats,
					setUserStats
				}}>
					<div className="App">
						<Header walletAddress={walletAddress}
							setWalletAddress={setWalletAddress}
						></Header>

						<main className='_container'>
							
							<HashRouter>
								<MarketRouter walletAddress={walletAddress}
							setWalletAddress={setWalletAddress}></MarketRouter>
							</HashRouter>
						</main>

						<Footer></Footer>
					</div>
				</UserStatsContext.Provider>
			</GlobalStatsContext.Provider>
			<Warning>
				DeDeLend is in beta. Use at your own risk
			</Warning>
		</React.Fragment>
		
	);
}

export default App;
