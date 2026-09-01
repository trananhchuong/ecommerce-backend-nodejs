import inventoryModel from "../inventory.model";

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "Unknown",
}: {
  productId: string;
  shopId: string;
  stock: number;
  location?: string;
}) => {
  const normalizedStock = Number.isFinite(stock) ? Math.max(0, Number(stock)) : 0;

  return inventoryModel.create({
    invent_productId: productId,
    invent_shopId: shopId,
    invent_stock: normalizedStock,
    invent_location: location || "Unknown",
    invent_reservations: [],
  });
};

export { insertInventory };
