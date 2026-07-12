"use client";

import { useRef, useEffect } from "react";
import { Printer, X, Check, Award } from "lucide-react";

export default function ReceiptModal({ isOpen, onClose, bill }) {
  const receiptRef = useRef();

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    // Elegant printing mechanism
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create iframe or simple print window to keep styles intact
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.id}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              background-color: #fff;
              color: #000;
              width: 320px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .footer { border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 4px 0; text-align: left; font-size: 14px; }
            .totals { margin-top: 15px; border-top: 1px dashed #000; padding-top: 8px; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 14px; }
            .bold { font-weight: bold; }
            .stamp {
              border: 3px double #d4af37;
              color: #d4af37;
              font-size: 18px;
              font-weight: bold;
              display: inline-block;
              padding: 5px 15px;
              margin: 15px 0;
              transform: rotate(-10deg);
              text-transform: uppercase;
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-luxury-dark border border-luxury-gold/30 rounded-2xl p-6 shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <h3 className="font-display font-semibold text-lg text-luxury-gold flex items-center gap-2">
            <Award className="w-5 h-5" />
            Invoice Receipt
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center min-h-0 max-h-[60vh] w-full pr-1">
          {/* Physical Receipt Mock */}
          <div
            ref={receiptRef}
            className="w-full bg-[#FCFBF7] text-[#121214] font-mono p-6 shadow-md relative overflow-hidden rounded-sm border-t-8 border-luxury-gold"
            style={{
              backgroundImage: "radial-gradient(#00000005 1px, transparent 0), radial-gradient(#00000005 1px, transparent 0)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 4px 4px"
            }}
          >
            {/* Top jagged cut visual */}
            <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden opacity-20">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-luxury-black rotate-45 transform -translate-y-2.5"></div>
              ))}
            </div>

            {/* Receipt Content */}
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold tracking-wider mt-2">FIRE BUN</h2>
              <p className="text-[11px] text-gray-600 uppercase tracking-widest">Luxury Diner & POS POS</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Plot 4B, Sector F, Islamabad</p>
              <p className="text-[10px] text-gray-500">Tel: +92 51 111-999-222</p>
              
              <div className="border-b border-dashed border-gray-400 my-4"></div>
            </div>

            {/* Meta Details */}
            <div className="text-[12px] space-y-1">
              <div className="flex justify-between">
                <span>INVOICE #:</span>
                <span className="font-bold">{bill.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formatDate(bill.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT:</span>
                <span className="font-bold uppercase">{bill.customerName}</span>
              </div>
              {bill.orderId && (
                <div className="flex justify-between">
                  <span>REF ORDER:</span>
                  <span>{bill.orderId}</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-4"></div>

            {/* Items Table */}
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="pb-1 font-bold">ITEM</th>
                  <th className="pb-1 text-center font-bold">QTY</th>
                  <th className="pb-1 text-right font-bold">PRICE</th>
                  <th className="pb-1 text-right font-bold">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bill.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-1">
                      <div className="font-semibold leading-tight">{item.name}</div>
                      {item.size && item.size !== "Standard" && (
                        <div className="text-[10px] text-gray-500">Size: {item.size}</div>
                      )}
                    </td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">Rs.{item.price}</td>
                    <td className="py-2 text-right font-bold">Rs.{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-b border-dashed border-gray-400 my-4"></div>

            {/* Totals Section */}
            <div className="text-[13px] space-y-1.5">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>Rs.{bill.totalAmount}</span>
              </div>
              {bill.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>GST Tax ({bill.tax}%):</span>
                  <span>Rs.{Math.round(bill.totalAmount * (bill.tax / 100))}</span>
                </div>
              )}
              {bill.discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>DISCOUNT:</span>
                  <span>-Rs.{bill.discount}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-1.5 flex justify-between font-bold text-[15px]">
                <span>TOTAL AMOUNT:</span>
                <span>Rs.{bill.grandTotal}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-4"></div>

            {/* Payment Details */}
            <div className="text-[12px] space-y-1">
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="font-bold">{bill.paymentMethod}</span>
              </div>
              {bill.cashReceived > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>CASH RECEIVED:</span>
                    <span>Rs.{bill.cashReceived}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-700">
                    <span>CHANGE GIVEN:</span>
                    <span>Rs.{bill.changeGiven}</span>
                  </div>
                </>
              )}
            </div>

            {/* Paid Stamp */}
            <div className="text-center my-4">
              <div className="stamp inline-block border-2 border-green-600 text-green-600 rounded px-3 py-1 font-bold text-md tracking-wider uppercase opacity-85 rotate-[-8deg] my-2 select-none">
                ★ PAID ★
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center text-[10px] text-gray-500 space-y-1 mt-4">
              <p className="font-bold">Thank you for dining with us!</p>
              <p>Powered by Fire Bun Premium POS</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-auto">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 orange-btn text-white"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-xl font-semibold text-sm transition-all bg-luxury-gray text-gray-300 hover:bg-white/5 border border-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
