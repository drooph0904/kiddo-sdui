import { Alert } from 'react-native';
import { handleAction } from './handleAction';
import { useCartStore } from '../store/cartStore';

beforeEach(() => {
  useCartStore.setState({ items: {} });
  jest.restoreAllMocks();
});

describe('handleAction (Universal Action Dispatcher)', () => {
  it('ADD_TO_CART routes to the cart store', () => {
    handleAction({ type: 'ADD_TO_CART', payload: { id: 'abc' } });
    expect(useCartStore.getState().items).toEqual({ abc: 1 });
  });

  it('REMOVE_FROM_CART routes to the cart store', () => {
    handleAction({ type: 'ADD_TO_CART', payload: { id: 'abc' } });
    handleAction({ type: 'REMOVE_FROM_CART', payload: { id: 'abc' } });
    expect(useCartStore.getState().items).toEqual({});
  });

  it('DEEP_LINK surfaces the destination without touching the cart', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    handleAction({ type: 'DEEP_LINK', payload: { url: '/category/snacks' } });
    expect(alertSpy).toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual({});
  });

  it('APPLY_MYSTERY_GIFT_COUPON surfaces the coupon without touching the cart', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    handleAction({ type: 'APPLY_MYSTERY_GIFT_COUPON', payload: { couponId: 'X1' } });
    expect(alertSpy).toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual({});
  });
});
