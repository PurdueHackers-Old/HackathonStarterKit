import React from 'react';
import dynamic from 'next/dynamic';

// @ts-ignore
const QR = dynamic(() => import('qrcode.react'), { ssr: false });

interface Props {
	email: string;
}

export const QRCode = ({ email }: Props) => {
	return <QR value={email} />;
};
