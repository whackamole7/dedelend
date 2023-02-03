import React from 'react';
import icon_user from '../img/icon-user.svg';

const AccountDroplist = ({ accounts, account }) => {
	function cutAddress (addr) {
		if (!addr) {
			return '';
		}
		
		return addr.slice(0, 10) + '...' + addr.slice(-5);
	}
	
	const accountCut = cutAddress(account);
	
	
	return (
		<div className="Account-droplist">
			<div className="Account-droplist__header">
				<img src={icon_user} alt="icon" />
				<span className='Account-droplist__address'>{accountCut}</span>
				<svg xmlns="http://www.w3.org/2000/svg" className='chevron-down' width="13" height="13" viewBox="0 0 13 13" fill="none">
					<path d="M2.60001 4.76667L7.10001 8.76667L11.6 4.76667" stroke="#747FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<div className="Account-droplist__items">
				{accounts?.map(acc => {
					return (
						<div className={"Account-droplist__item" + (account === acc ? ' chosen' : '')}>
							<div className="Account-droplist__item-address">
								{cutAddress(acc)}
							</div>
							<div className="Account-droplist__item-balance">
								$1,000
							</div>
						</div>
					)
				})}
				<button className='btn_inline'>Create account</button>
			</div>
		</div>
	);
};

export default AccountDroplist;