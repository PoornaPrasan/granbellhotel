import React from 'react';
import { X, Download, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceDetailProps {
	invoice: any;
	onClose: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onClose }) => {
  const getReservationCode = (inv: any) => {
    const rid = inv?.reservationId;
    if (!rid) return '—';
    if (typeof rid === 'string') return `#${rid.slice(-6)}`;
    const id = (rid as any)?._id || (rid as any)?.id;
    if (id) return `#${String(id).slice(-6)}`;
    const roomNum = (rid as any)?.roomNumber;
    return roomNum ? `Room ${roomNum}` : '—';
  };
	const generatePdf = () => {
		const doc = new jsPDF({ unit: 'pt', format: 'a4' });
		let y = 40;
		// Header
		doc.setFontSize(18);
		doc.text('Grand Bell Hotel', 40, y);
		y += 22;
		doc.setFontSize(12);
		doc.text('Invoice', 40, y);
		y += 20;
		// Invoice meta
		doc.text(`Invoice ID: ${(invoice._id || invoice.id || '').slice(-6)}`, 40, y); y += 16;
		doc.text(`Reservation: ${getReservationCode(invoice)}`, 40, y); y += 16;
		doc.text(`Customer: ${invoice.customerName || ''}`, 40, y); y += 16;
		doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 40, y); y += 24;
		// Charges
		doc.setFontSize(14);
		doc.text('Charges', 40, y); y += 18;
		doc.setFontSize(12);
		doc.text(`Room Charges: $${(invoice.roomCharges ?? invoice.totalAmount)?.toLocaleString?.() || invoice.roomCharges || invoice.totalAmount}`, 40, y); y += 16;
		const items = invoice.additionalCharges || [];
		if (items.length) {
			items.forEach((it: any) => {
				doc.text(`- ${it.description}: $${it.amount}`, 50, y);
				y += 16;
			});
		}
		y += 8;
		doc.text(`Total Amount: $${invoice.totalAmount?.toLocaleString?.() || invoice.totalAmount}`, 40, y); y += 16;
		doc.text(`Payment Status: ${String(invoice.paymentStatus).toUpperCase()}`, 40, y); y += 16;
		doc.text(`Payment Method: ${(invoice.paymentMethod || '').replace('_',' ')}`, 40, y); y += 24;
		// Footer
		doc.setFontSize(10);
		doc.text('Thank you for staying with us!', 40, y);
		doc.save(`invoice_${(invoice._id || invoice.id || '').slice(-6)}.pdf`);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
				<div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700">
					<div className="flex items-center space-x-3">
						<div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900">
							<Building2 className="h-6 w-6" />
						</div>
						<div>
							<div className="text-white font-semibold">Grand Bell Hotel</div>
							<div className="text-blue-200 text-xs">Invoice Details</div>
						</div>
					</div>
					<button onClick={onClose} className="text-white/80 hover:text-white">
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="p-6 space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div>
						<div className="text-gray-500 text-sm">Reservation</div>
						<div className="font-semibold text-gray-900">{getReservationCode(invoice)}</div>
						</div>
						<div>
							<div className="text-gray-500 text-sm">Payment Status</div>
							<div className={`font-semibold ${
								invoice.paymentStatus === 'paid' ? 'text-green-600' :
								invoice.paymentStatus === 'partial' ? 'text-yellow-600' :
								invoice.paymentStatus === 'refunded' ? 'text-gray-600' : 'text-red-600'
							}`}>{String(invoice.paymentStatus).toUpperCase()}</div>
						</div>
						<div>
							<div className="text-gray-500 text-sm">Total Amount</div>
							<div className="font-semibold text-gray-900">${invoice.totalAmount?.toLocaleString?.() || invoice.totalAmount}</div>
						</div>
						<div>
							<div className="text-gray-500 text-sm">Payment Method</div>
							<div className="font-semibold text-gray-900">{(invoice.paymentMethod || '').replace('_',' ')}</div>
						</div>
					</div>

					<div className="border-t border-gray-100 pt-4">
						<div className="text-gray-800 font-medium mb-2">Charges</div>
						<div className="text-sm text-gray-600">Room Charges: ${invoice.roomCharges?.toLocaleString?.() || invoice.totalAmount}</div>
						{(invoice.additionalCharges || []).length > 0 && (
							<ul className="mt-2 space-y-1 text-sm text-gray-600">
								{invoice.additionalCharges.map((it: any, idx: number) => (
									<li key={idx} className="flex justify-between"><span>{it.description}</span><span>${it.amount}</span></li>
								))}
							</ul>
						)}
						<div className="mt-4 flex justify-end">
							<div className="text-gray-900 font-semibold">Total: ${invoice.totalAmount?.toLocaleString?.() || invoice.totalAmount}</div>
						</div>
					</div>
				</div>
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
					<button onClick={generatePdf} className="inline-flex items-center px-4 py-2 bg-yellow-400 text-blue-900 rounded hover:bg-yellow-300">
						<Download className="h-4 w-4 mr-2" /> Download PDF
					</button>
				</div>
			</div>
		</div>
	);
};

export default InvoiceDetail;
