export default function currencyFormatter(number: number) {
  if (!number) return null;
  let usDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return usDollar.format(number);
}
