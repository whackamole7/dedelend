import React from 'react';

const Modal = ({children, className, visible, setVisible, resetModal}) => {
	const classes = ['modal', className]

	
	if (visible) {
		classes.push('active')
	}

	const closeModal = () => {
		setVisible(false)
		resetModal()
	}
	
	return (
		<div className={classes.join(' ')} onMouseDown={closeModal}>
			<div className="modal__content-wrapper">
				<div className="modal__content" onMouseDown={e => e.stopPropagation()}>
					<button className="close-btn" onClick={closeModal}></button>
					{children}
				</div>
			</div>
		</div>
	);
};

export default Modal;