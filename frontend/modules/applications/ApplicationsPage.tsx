import React, { useState, useRef } from 'react';
import Router from 'next/router';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { IContext, IApplication } from '../../@types';
import { redirectIfNotAuthenticated } from '../../utils/session';
import { err, endResponse } from '../../utils';
import { Role } from '../../../shared/user.enums';
import { ApplicationsTable } from './ApplicationsTable';
import { RowInfo, Column, Filter } from 'react-table';
import { connect } from 'react-redux';
import { getApplications } from '../../api';

interface Props {
	flashError: (msg: string, ctx?: IContext) => void;
	clear: (ctx?: IContext) => void;
}

const AppsPage = ({ flashError, clear }: Props) => {
	const [state, setState] = useState({
		applications: [],
		pagination: { pageSize: 10, page: 1, pages: 1 },
		loading: true
	});

	const filtered = useRef([]);

	const fetch = async params => {
		try {
			clear();
			setState(prev => ({ ...prev, loading: true }));
			const response = await getApplications(null, params);
			setState(prev => ({ ...prev, loading: false, ...response }));
		} catch (error) {
			setState(prev => ({ ...prev, loading: false }));
			flashError(err(error));
		}
	};

	const onFetchData = tableState => {
		const page: number = tableState.page + 1;
		const limit: number = tableState.pageSize;
		const sort = tableState.sorted.reduce(
			(prev, curr) => ({ ...prev, [curr.id]: curr.desc ? -1 : 1 }),
			{}
		);
		const filter = filtered.current
			.filter(val => val.value !== 'all')
			.reduce((prev, curr) => ({ ...prev, [curr.id]: curr.value }), {});
		const params = { page, limit, filter, sort };
		fetch(params);
	};

	const onClick = (rowInfo: RowInfo, column: Column<IApplication>) => () => {
		if (rowInfo && rowInfo.original && column.Header !== 'Status')
			Router.push(`/application?id=${rowInfo.original._id}`);
	};

	const onFilter = (newFiltered: Filter[]) => (filtered.current = newFiltered);

	return (
		<div>
			<h3>Applications Page</h3>
			<br />
			<ApplicationsTable
				{...state}
				onFetchData={onFetchData}
				onClick={onClick}
				onFilter={onFilter}
				filtered={filtered.current}
			/>
		</div>
	);
};

AppsPage.getInitialProps = async (ctx: IContext) => {
	if (redirectIfNotAuthenticated('/', ctx, { roles: [Role.EXEC] })) return endResponse(ctx);
};

export const ApplicationsPage = connect(
	null,
	{ flashError: sendErrorMessage, flashSuccess: sendSuccessMessage, clear: clearFlashMessages }
)(AppsPage);
