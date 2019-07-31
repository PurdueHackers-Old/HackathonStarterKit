import React, { Component, ChangeEvent } from 'react';
import { sendErrorMessage, sendSuccessMessage, clearFlashMessages } from '../../redux/actions';
import { IContext, IApplication } from '../../@types';
import { err } from '../../utils';
import { connect } from 'react-redux';
import { Status } from '../../../shared/app.enums';
import { updateApplicationStatus } from '../../api';

interface Props {
	application: IApplication;
	flashError?: (msg: string, ctx?: IContext) => void;
	flashSuccess?: (msg: string, ctx?: IContext) => void;
	clear?: (ctx?: IContext) => void;
}

@((connect as any)(null, {
	flashError: sendErrorMessage,
	flashSuccess: sendSuccessMessage,
	clear: clearFlashMessages
}))
export class StatusSelector extends Component<Props> {
	state = {
		loading: true,
		status: this.props.application.statusInternal
	};

	onSelect = async (e: ChangeEvent<HTMLSelectElement>) => {
		const status = e.target.value as Status;

		const { flashError, flashSuccess, clear } = this.props;
		try {
			clear();
			await updateApplicationStatus(this.props.application._id, status);
			this.setState({ status });
			return flashSuccess('Successfully updated application status!');
		} catch (error) {
			return flashError(err(error));
		}
	};

	render() {
		return (
			<div>
				<select required name="status" onChange={this.onSelect} value={this.state.status}>
					{Object.values(Status).map(status => (
						<option value={status} key={status}>
							{status}
						</option>
					))}
				</select>
			</div>
		);
	}
}
