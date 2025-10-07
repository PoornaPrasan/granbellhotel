import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { billingApi } from '../../services/api';
import { FileText, Download } from 'lucide-react';
import InvoiceDetail from './InvoiceDetail';

interface Invoice {
	_id?: string;
	id?: string;
	reservationId: string;
	totalAmount: number;
	paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
	paymentMethod: 'credit_card' | 'cash';
	createdAt?: string;
}

const MyInvoices: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // Admin/Clerk: get all bills; Customer: backend filters to own bills
        const res = await billingApi.getAll();
        setInvoices(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchInvoices();
  }, [isAuthenticated, hasRole]);

	const getReservationCode = (inv: any) => {
		const rid = (inv as any).reservationId;
		if (!rid) return '—';
		if (typeof rid === 'string') return `#${rid.slice(-6)}`;
		const id = (rid as any)?._id || (rid as any)?.id;
		if (id) return `#${String(id).slice(-6)}`;
		const roomNum = (rid as any)?.roomNumber;
		return roomNum ? `Room ${roomNum}` : '—';
	};

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized</h2>
        <p className="text-gray-600">Please log in to view invoices.</p>
      </div>
    );
  }

	return (
		<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{hasRole(['admin','clerk']) ? 'All Invoices' : 'My Invoices'}</h1>
        <p className="text-gray-600">{hasRole(['admin','clerk']) ? 'All customer bills' : 'View and download your invoices'}</p>
      </div>

			<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
				<div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex items-center space-x-2">
					<FileText className="h-5 w-5 text-yellow-400" />
					<h2 className="font-semibold">Invoices</h2>
				</div>
				<div className="p-6">
					{loading ? (
						<div className="text-center text-gray-500">Loading invoices...</div>
					) : error ? (
						<div className="text-center text-red-600">{error}</div>
					) : invoices.length === 0 ? (
						<div className="text-center text-gray-500">No invoices found.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation ID</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-100">
									{invoices.map(inv => (
										<tr key={(inv as any)._id || (inv as any).id} className="hover:bg-gray-50">
									<td className="px-6 py-4 text-sm text-gray-800">{getReservationCode(inv)}</td>
											<td className="px-6 py-4 text-sm font-semibold text-gray-900">${inv.totalAmount?.toLocaleString?.() || inv.totalAmount}</td>
											<td className="px-6 py-4 text-sm">
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${
													inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
													inv.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
													inv.paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
												}`}>{inv.paymentStatus.toUpperCase()}</span>
											</td>
											<td className="px-6 py-4 text-sm space-x-3">
												<button
													onClick={() => setSelectedInvoice(inv)}
													className="inline-flex items-center px-3 py-1.5 rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
												>
													View
												</button>
												<button
													onClick={() => setSelectedInvoice(inv)}
													className="inline-flex items-center px-3 py-1.5 rounded border border-yellow-200 text-yellow-700 hover:bg-yellow-50"
												>
													<Download className="h-4 w-4 mr-1" /> Download
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{selectedInvoice && (
				<InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
			)}
		</div>
	);
};

export default MyInvoices;
