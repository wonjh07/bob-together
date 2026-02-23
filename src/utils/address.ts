export function extractDistrict(address: string): string {
  if (!address) return '';
  const parts = address.split(' ');
  return parts.find((part) => part.endsWith('동') || part.endsWith('구')) || '';
}
