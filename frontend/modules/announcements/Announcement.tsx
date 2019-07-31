import React from 'react';
import { IAnnouncement } from '../../@types';

interface IAdminActions {
	onRelease: (id: string) => void;
	onDelete: (id: string) => void;
}

interface Props extends IAnnouncement {
	admin?: IAdminActions;
}

const AdminActions = ({ _id, released, admin: { onRelease, onDelete } }: Props) => {
	return (
		<>
			{!released && (
				<button id={_id} onClick={(e: any) => onRelease(e.target.id)}>
					Release
				</button>
			)}
			<button id={_id} onClick={(e: any) => onDelete(e.target.id)}>
				Delete
			</button>
		</>
	);
};

export default (props: Props) => {
	const { _id, title, body, labels, released, admin } = props;
	return (
		<div>
			Title: {title}
			<br />
			Body: {body}
			<br />
			Labels: {labels}
			<br />
			{admin && <AdminActions {...props} />}
			{/* {!released && (
				<button id={_id} onClick={(e: any) => onRelease(e.target.id)}>
					Release
				</button>
			)} */}
			<br />
			<hr />
			<br />
		</div>
	);
};
