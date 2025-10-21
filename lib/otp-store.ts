// In-memory OTP store (for production, consider Redis or database)
interface OTPData {
  otp: string;
  email: string;
  expiresAt: number;
  verified: boolean;
}

class OTPStore {
  private store: Map<string, OTPData> = new Map();

  set(email: string, otp: string, ttlMinutes: number = 10) {
    this.store.set(email, {
      otp,
      email,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      verified: false,
    });
  }

  get(email: string): OTPData | undefined {
    const data = this.store.get(email);
    if (!data) return undefined;
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      this.store.delete(email);
      return undefined;
    }
    
    return data;
  }

  verify(email: string, otp: string): boolean {
    const data = this.get(email);
    if (!data || data.otp !== otp) return false;
    
    // Mark as verified
    data.verified = true;
    this.store.set(email, data);
    return true;
  }

  isVerified(email: string): boolean {
    const data = this.get(email);
    return data?.verified || false;
  }

  delete(email: string) {
    this.store.delete(email);
  }

  // Clean up expired OTPs periodically
  cleanup() {
    const now = Date.now();
    for (const [email, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(email);
      }
    }
  }
}

export const otpStore = new OTPStore();

// Run cleanup every 5 minutes
setInterval(() => otpStore.cleanup(), 5 * 60 * 1000);
