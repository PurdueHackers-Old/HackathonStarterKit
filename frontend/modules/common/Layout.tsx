import React from 'react';
import { connect } from 'react-redux';
import Header from './Header';
import FlashMessage from './FlashMessage';
import { Role } from '../../../shared/user.enums';

interface StateToProps {
	token: string;
	role: Role;
	green: string;
	red: string;
	children: React.ReactNode;
}

const Layout = ({ token, role, green, red, children }: StateToProps) => {
	return (
		<div>
			<Header token={token} role={role} />
			<FlashMessage green={green} red={red} />
			{children}
		</div>
	);
};

const mapStateToProps = state => ({
	token: state.sessionState.token,
	role: state.sessionState.user && state.sessionState.user.role,
	...state.flashState
});

export default connect<StateToProps>(mapStateToProps)(Layout);
