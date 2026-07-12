import { NextResponse } from "next/server";
import { getBills, saveBill, updateOrderStatus } from "@/data/database";

export async function GET() {
  try {
    const bills = getBills();
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid bill data. Customer name and items are required." }, { status: 400 });
    }

    const newBill = saveBill({
      customerName: body.customerName,
      orderId: body.orderId || null,
      items: body.items,
      totalAmount: body.totalAmount,
      tax: body.tax || 0,
      discount: body.discount || 0,
      grandTotal: body.grandTotal || body.totalAmount,
      paymentMethod: body.paymentMethod || "Cash",
      cashReceived: body.cashReceived || 0,
      changeGiven: body.changeGiven || 0
    });

    // If there is an associated order, auto-complete it
    if (body.orderId) {
      updateOrderStatus(body.orderId, "completed");
    }

    return NextResponse.json({ success: true, bill: newBill });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
