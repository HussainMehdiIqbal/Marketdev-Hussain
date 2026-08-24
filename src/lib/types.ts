export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string | null;
  priceInPkr: number;
  featured: boolean;
  createdAt: string | Date;
  category: { name: string; slug: string } | null;
  technologies: { technology: { name: string; icon: string | null } }[];
};

export type ProjectDetail = ProjectSummary & {
  description: string;
  features: string[] | null;
  requirements: string[] | null;
  whatIsIncluded: string[] | null;
  screenshots: string[] | null;
  demoVideoUrl: string | null;
  demoUrl: string | null;
  version: string;
  license: string;
  updatedAt: string | Date;
  installationGuide: { privateToPurchasers: boolean; content: unknown } | null;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_SUBMITTED"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "COMPLETED";

export type OrderWithProject = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  amountPkr: number;
  verificationDeadline: string | null;
  createdAt: string;
  project: { id: string; title: string; slug: string; version: string; thumbnail: string | null };
  payment: { id: string; rejectionReason: string | null } | null;
  license: { licenseCode: string } | null;
};
