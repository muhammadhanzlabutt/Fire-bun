import { NextResponse } from "next/server";
import { getOrders, saveOrder, updateOrderStatus } from "@/data/database";

export async function GET() {
  try {
    const orders = getOrders();
    // Sort orders by timestamp descending so newer ones appear first, or keep order
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, status, order } = body;

    // Action: Update status (used by staff/admin)
    if (action === "updateStatus") {
      if (!id || !status) {
        return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
      }
      const success = updateOrderStatus(id, status);
      if (success) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Action: Place new order (used by customer)
    // Accept order direct from payload or inside "order" field
    const orderData = order || body;

    if (!orderData.customerName || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: "Invalid order data. Customer name and items are required." }, { status: 400 });
    }

    const newOrder = saveOrder({
      customerName: orderData.customerName,
      tableNumber: orderData.tableNumber || "Takeaway",
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: "pending"
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
