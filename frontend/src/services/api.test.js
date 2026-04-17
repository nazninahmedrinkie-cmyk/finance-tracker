
// Test currency formatting
test('formats Indian currency correctly', () => {
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n || 0);

  expect(fmt(5000)).toBe('₹5,000');
  expect(fmt(0)).toBe('₹0');
  expect(fmt(null)).toBe('₹0');
});

// Test date formatting
test('formats date correctly', () => {
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });

  const result = fmtDate("2024-01-15");
  expect(result).toContain("Jan");
  expect(result).toContain("2024");
});