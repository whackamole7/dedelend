import React, { useContext, useEffect, useState } from 'react';
import Logo from './components/UI/logo/Logo'
import Button from './components/UI/button/Button';
import Wallet from './components/Wallet';
import { GlobalStatsContext, UserStatsContext } from './context/context';
import { connectWallet } from './components/utils/wallet';
import { useLocation, useNavigate } from 'react-router-dom';
import Tabs from './components/Tabs';
import RegisterModal from './components/UI/modal/RegisterModal';
import AccountDroplist from './components/AccountDroplist';


const Header = (props) => {
	const {
		walletAddress, 
		setWalletAddress, 
		account,
		setAccount,
		accounts,
		registerVisible,
		setRegisterVisible
	} = props;

	const { setGlobalStats } = useContext(GlobalStatsContext)
	const { setUserStats } = useContext(UserStatsContext)
	
	const [registerStep, setRegisterStep] = useState(0);
	const [registerLoading, setRegisterLoading] = useState(false);
	const [depositVal, setDepositVal] = useState('');
	
	async function register() {
		// setRegisterLoading(true);
		setRegisterStep(1);
	}

	async function approveAll() {
		
	}

	useEffect(() => {
		connectWallet(setWalletAddress)
	}, [window.ethereum?.networkVersion])

	const loc = useLocation();
	const nav = useNavigate();
	const headerLinks = [
		{
			name: 'Perpetuals',
			to: '/perpetuals',
		},
		{
			name: 'Earn',
			to: '/earn',
		},
		{
			name: 'Margin Account',
			to: '/account',
			isHidden: !account,
		},
		{
			name: 'Old Version',
			to: 'https://old.dedelend.co/',
			isExternal: true,
		},
	]

	useEffect(() => {
		if (walletAddress) {
			/* getUserStats(walletAddress)
				.then(stats => {
					setUserStats(stats)

					getOptionByUser(walletAddress)
						.then(options => {
							setUserStats({
								...stats,
								options
							})
						})
				}) */
		} else {
			setAccount('');
			if (loc.pathname === '/account') {
				nav('/');
			}
		}
	}, [walletAddress])
	
	headerLinks.find(link => {
		link.isActive = loc.pathname === link.to;
		return link.isActive;
	})

	return (
		<header className='header'>
			<div className="header__content _container">
				<div className="header__nav">
					<Logo />
					<Tabs className='header__links' links={headerLinks} />
				</div>

				<div className="Account-data">
					{walletAddress ?
						<>
							{account ? 
								<AccountDroplist
									accounts={accounts}
									account={account} />
								:
								<div className="account-btn-wrapper">
									<Button className='account-btn' isMain={true} onClick={(e) => {
										setAccount('0x0641bc55ddab3b9636e82cbf87ede3c3c533039d');
									}}>
										{window.outerWidth > 480 ?
										'Create Margin Account      '
										: 'Create Account      '}
									</Button>
								</div>
								}
							<Wallet address={walletAddress} 
								setAddress={setWalletAddress}
								setAccount={setAccount}
							/>
						</>
						:
						<Button isMain={true} onClick={(e) => {
							connectWallet(setWalletAddress)
						}}>Connect wallet</Button>}
				</div>

				{loc.pathname.startsWith('/perpetuals') && (
					<RegisterModal
						visible={registerVisible}
						setVisible={setRegisterVisible}
						onRegisterClick={register}
						onApproveClick={approveAll}
						curStep={registerStep}
						isLoading={registerLoading}
						depositVal={depositVal}
						setDepositVal={setDepositVal}
						 />
				)}
				
			</div>
		</header>
	);
};

export default Header;