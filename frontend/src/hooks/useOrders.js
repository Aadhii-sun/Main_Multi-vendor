import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../services/orders';

export const ORDERS_QUERY_KEY = ['orders', 'current-user'];

export const useOrders = () => {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

