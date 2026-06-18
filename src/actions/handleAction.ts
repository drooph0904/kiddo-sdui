/**
 * The Universal Action Dispatcher.
 *
 * Every interactive node in the tree (banners, cards, CTAs) is "dumb": on press it does
 * nothing but hand its declarative `action` object to this one coordinator. All business
 * logic lives here, so the layout components stay decoupled and fully ignorant of it.
 */
import { Alert } from 'react-native';
import type { Action } from '../types/schema';
import { useCartStore } from '../store/cartStore';

export function handleAction(action: Action): void {
  switch (action.type) {
    case 'ADD_TO_CART':
      // getState() mutates the store without subscribing this caller to re-renders.
      useCartStore.getState().addItem(action.payload.id);
      break;

    case 'REMOVE_FROM_CART':
      useCartStore.getState().removeItem(action.payload.id);
      break;

    case 'DEEP_LINK':
      // No navigation library in scope — surface the intended destination instead.
      Alert.alert('Deep Link', `Would navigate to: ${action.payload.url}`);
      break;

    case 'APPLY_MYSTERY_GIFT_COUPON':
      Alert.alert('🎁 Mystery Gift', `Coupon applied: ${action.payload.couponId}`);
      break;

    default: {
      // Compile-time exhaustiveness guard: adding an Action variant without handling it
      // breaks the build here. At runtime it also absorbs any corrupt/unknown action type.
      const unexpected: never = action;
      console.warn('[handleAction] Unhandled action type', unexpected);
    }
  }
}
