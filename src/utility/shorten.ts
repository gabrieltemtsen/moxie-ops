export function shortenWalletAddress(address: string): string {
    const prefix = address.slice(0, 2); // Get the first 2 characters
    const suffix = address.slice(-4); // Get the last 4 characters
    return `${prefix}...${suffix}`;
}

