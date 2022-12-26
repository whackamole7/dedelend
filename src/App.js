// Style
import './style/App.scss'

// Main
import React, { useState } from 'react';

import Header from './Header';
import Footer from './Footer';
import AppRouter from './components/AppRouter';
import { HashRouter } from 'react-router-dom';
import { UserStatsContext } from './context/context';
import { GlobalStatsContext } from './context/context';
import Warning from './components/UI/warning/Warning';
import Favicon from 'react-favicon';
import { ToastContainer } from 'react-toastify';
import { cssTransition } from 'react-toastify';
import EventToastContainer from './views/gmx-test/components/EventToast/EventToastContainer';



function App() {
	const [walletAddress, setWalletAddress] = useState('');
	const [dgAddress, setDgAddress] = useState('');
	
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

	const Jelly = cssTransition({
		enter: "jellyIn",
		exit: "jellyOut",
	});
	
	return (
		<>
			<Favicon url="https://i.imgur.com/dLCWse0.png" />
			
			<GlobalStatsContext.Provider value={{
				globalStats,
				setGlobalStats
			}}>
				<UserStatsContext.Provider value={{
					userStats,
					setUserStats
				}}>
					<HashRouter>
						<ToastContainer
							limit={1}
							transition={Jelly}
							position="bottom-right"
							// autoClose={}
							hideProgressBar={true}
							newestOnTop={false}
							closeOnClick={false}
							draggable={false}
							pauseOnHover={false}
						/>
						<EventToastContainer />
						<div className="App">
							<Header walletAddress={walletAddress}
								setWalletAddress={setWalletAddress}
								dgAddress={dgAddress}
								setDgAddress={setDgAddress}
							/>

							<main className='_container'>
								<AppRouter
									walletAddress={walletAddress}
									setWalletAddress={setWalletAddress} 
									dgAddress={dgAddress}
									setDgAddress={setDgAddress}
								/>
							</main>

							<Footer />
						</div>
					</HashRouter>
					
				</UserStatsContext.Provider>
			</GlobalStatsContext.Provider>
			<Warning>
				DeDeLend is in beta. Use at your own risk
			</Warning>
		</>
	);
}

export default App;
