import Database from "../../../lib/db";
export const prerender = false;

interface Order {
  customerId: number;
  productId: number;
  amount: number;
}

export async function GET({}) {
  const result = (await Database.getInstance().then((database) => {
    return database.getKrambambouliOrders();
  })) as Order[];
  return result.reduce(
    (prev, current) => {
      if (current.productId === 1) return { ...prev, classic: prev.classic++ };
      else return { ...prev, minus: prev.minus++ };
    },
    { classic: 0, minus: 0 },
  );
}
