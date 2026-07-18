import type Lenis from "lenis";

declare global {
  interface Window {
    __repoDoctorLenis?: Lenis;
  }
}

export {};
