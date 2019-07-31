import React from 'react';

interface Props {
	green: string;
	red: string;
}

const FlashMessage = ({ green, red }: Props) => {
	return (
		<React.Fragment>
			{green && (
				<div className="section alert-section" style={{ paddingTop: 0 }}>
					<div className="section-container">
						<div className="alert alert-success" role="alert">
							{green}
						</div>
					</div>
				</div>
			)}
			{red && (
				<div className="section alert-section" style={{ paddingTop: 0 }}>
					<div className="section-container">
						<div className="alert alert-danger" role="alert">
							{red}
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
};

FlashMessage.defaultProps = {
	green: '',
	red: ''
};

export default FlashMessage;
