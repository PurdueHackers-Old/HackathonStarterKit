import React from 'react';

export default (filters: { text: string; value: string }[]) => ({ filter, onChange }) => (
	<select onChange={event => onChange(event.target.value)}>
		<option value="all">All</option>
		{filters.map(fill => (
			<option key={fill.value} value={fill.value}>
				{fill.text}
			</option>
		))}
	</select>
);
