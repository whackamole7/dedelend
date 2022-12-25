import React from 'react';
import { Link } from "react-router-dom";

const Tabs = ({className, links}) => {
	const cls = [className, 'tabs']
	
	return (
		<div className={cls.join(' ')}>
			{links.map((link) => {
				const linkCls = ['btn', 'btn_tab', link.isActive ? 'active' : '']
				const linkEl = link.isExternal ?
					<a target="_blank" rel="noreferrer" href={link.to} className={linkCls.join(' ')} key={link.to}>{link.name}</a>
					: <Link to={link.to} className={linkCls.join(' ')} key={link.to}>{link.name}</Link>
				return (
					linkEl
				)
			})}
			
		</div>
	);
};

export default Tabs;