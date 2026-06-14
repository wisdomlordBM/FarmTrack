import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';

export default function VerifyPage({ type }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/verify/${type}/${id}`)
      .then(res => setData(res.data))
      .catch(() => setData({ valid: false, message: 'Could not verify receipt' }))
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const itemLabel =
    type === 'sale' ? `${data?.cratesSold} crates of eggs`
    : type === 'birdsale' ? `${data?.numberOfBirds} birds`
    : `${data?.numberOfBags} bags of manure`;

  const pricePerUnit =
    type === 'sale' ? data?.pricePerCrate
    : type === 'birdsale' ? data?.pricePerBird
    : data?.pricePerBag;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {data?.valid ? (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-7 py-8 text-center text-white">
              <CheckCircle2 size={56} className="mx-auto mb-3" />
              <h1 className="text-2xl font-black">Valid Receipt</h1>
              <p className="text-emerald-100 text-sm mt-1">{data.type} — Receipt #{data.receiptNo}</p>
            </div>

            <div className="p-7 space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-1">
                  <ShieldCheck size={18} /> {data.farm?.farmName}
                </div>
                {data.farm?.phone && <p className="text-xs text-emerald-600">{data.farm.phone}</p>}
                {data.farm?.address && <p className="text-xs text-emerald-600">{data.farm.address}</p>}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-semibold text-slate-900">{data.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(data.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item</span>
                  <span className="font-semibold text-slate-900">{itemLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit Price</span>
                  <span className="font-semibold text-slate-900">₦{pricePerUnit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-black text-slate-900">₦{data.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-bold text-emerald-600">₦{data.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                    data.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                    data.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-600'
                  }`}>{data.paymentStatus}</span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 pt-2">
                ✅ This receipt was verified directly against FarmTrack's records.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-br from-rose-500 to-red-600 px-7 py-8 text-center text-white">
              <XCircle size={56} className="mx-auto mb-3" />
              <h1 className="text-2xl font-black">Receipt Not Found</h1>
              <p className="text-rose-100 text-sm mt-1">{data?.message || 'This receipt could not be verified'}</p>
            </div>
            <div className="p-7 text-center">
              <p className="text-slate-500 text-sm">
                This QR code does not correspond to any receipt in our records. If you believe this is an error, contact the farm directly.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">Powered by FarmTrack</p>
      </motion.div>
    </div>
  );
}