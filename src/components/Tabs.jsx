import React from 'react';
import { Link } from "react-router-dom";

const Tabs = ({className, links}) => {
	const cls = [className, 'tabs']
	
	return (
		<div className={cls.join(' ')}>
			{links.map((link) => {
				const linkCls = ['btn', 'btn_tab', link.isActive ? 'active' : '']
				return (
					<Link to={link.to} className={linkCls.join(' ')} key={link.to}>{link.name}</Link>
				)
			})}
			
		</div>
	);
};

export default Tabs;