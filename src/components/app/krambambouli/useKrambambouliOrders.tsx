import { usePage } from "@/components/shared/hooks/usePage";
import { orderSchema, type OrderData } from "@/lib/domain/krambambouli";
import { pageSchema, type Page } from "@/lib/domain/page";
import { API_ROUTES } from "@/lib/routes";

type Props = {
  page: Page<OrderData>;
};

type Filters = {
  orderNumber: number | null;
  date: string | null;
  name: string;
  price: number | null;
  received: boolean | null;
  paid: boolean | null;
};

const initialFilters: Filters = {
  orderNumber: null,
  date: null,
  name: "",
  price: null,
  received: null,
  paid: null,
};

export default function useKrambambouliOrders(props: Props) {
  const { itemPage, filters, setFilters, setPage, error, loading } = usePage(
    API_ROUTES.KRAMBALBOULI.ORDERS.url,
    initialFilters,
    pageSchema(orderSchema),
    props.page,
  );

  return {
    krambambouliOrderPage: itemPage,
    setPage,
    filters,
    setFilters,
    error,
    loading,
  };
}
