import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/data/database";

export async function GET() {
  try {
    const menu = getMenu();
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, item, id } = body;
    const menu = getMenu();

    if (action === "add") {
      if (!item || !item.name || !item.category || !item.prices) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      
      // Auto-generate standard sizes or keep sizes from user input
      const sizes = item.sizes || Object.keys(item.prices);
      const newItem = {
        id: item.id || `item-${Date.now()}`,
        name: item.name,
        category: item.category,
        description: item.description || "",
        sizes: sizes,
        prices: item.prices
      };

      menu.push(newItem);
      saveMenu(menu);
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === "edit") {
      if (!id || !item) {
        return NextResponse.json({ error: "Missing ID or item details" }, { status: 400 });
      }

      const index = menu.findIndex(i => i.id === id);
      if (index !== -1) {
        // Keep sizes in sync with prices keys if not provided
        const sizes = item.sizes || Object.keys(item.prices || menu[index].prices);
        menu[index] = {
          ...menu[index],
          ...item,
          sizes: sizes
        };
        saveMenu(menu);
        return NextResponse.json({ success: true, item: menu[index] });
      }
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
      }

      const filtered = menu.filter(i => i.id !== id);
      if (filtered.length === menu.length) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }
      saveMenu(filtered);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
