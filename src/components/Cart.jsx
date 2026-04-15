import LinkStorer from './LinkStorer';

export default function Cart() {
  // Re-uses LinkStorer's robust logic but dynamically writes/reads from 'cart_items' collection instead
  return <LinkStorer collectionName="cart_items" title="Cart Links" />;
}
