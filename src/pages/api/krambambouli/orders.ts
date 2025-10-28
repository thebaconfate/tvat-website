import Database from "../../../lib/database";

export const prerender = false;

interface Order {
  productId: number;
  amount: number;
}

export async function GET({}) {
  const result = (await Database.getInstance().then((database) => {
    return database.getKrambambouliOrders();
  })) as Order[];
  const orders = result.reduce(
    (prev, current) => {
      if (current.productId === 1)
        return { ...prev, classic: prev.classic + current.amount };
      else return { ...prev, minus: prev.minus + current.amount };
    },
    { classic: 0, minus: 0 },
  );
  return new Response(JSON.stringify(orders), { status: 200 });
}
