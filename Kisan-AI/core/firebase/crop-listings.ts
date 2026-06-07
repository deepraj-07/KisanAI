import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/core/firebase/client";

export type ListingStatus = "active" | "sold" | "inactive";

export interface CropListing {
  id: string;
  cropName: string;
  quantity: number;
  quantityUnit: "kg" | "quintal";
  photos: string[];
  thresholdPrice: number;
  location: {
    state: string;
    district: string;
    villageOrTown: string;
  };
  contactNumber: string;
  userId: string;
  createdAt: string;
  status: ListingStatus;
}

export interface CreateCropListingInput {
  cropName: string;
  quantity: number;
  quantityUnit: "kg" | "quintal";
  photos: string[];
  thresholdPrice: number;
  location: {
    state: string;
    district: string;
    villageOrTown: string;
  };
  contactNumber: string;
  userId: string;
}

export async function createCropListing(input: CreateCropListingInput): Promise<void> {
  await addDoc(collection(db, "cropListings"), {
    ...input,
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function getActiveCropListings(filters?: {
  cropName?: string;
  state?: string;
  district?: string;
}): Promise<CropListing[]> {
  const constraints: QueryConstraint[] = [where("status", "==", "active")];

  if (filters?.cropName) constraints.push(where("cropName", "==", filters.cropName));
  if (filters?.state) constraints.push(where("location.state", "==", filters.state));
  if (filters?.district) constraints.push(where("location.district", "==", filters.district));

  const q = query(collection(db, "cropListings"), ...constraints);
  const snap = await getDocs(q);

  const rows = snap.docs.map((doc) => {
    const data = doc.data() as Omit<CropListing, "id" | "createdAt"> & {
      createdAt?: { toDate?: () => Date };
    };

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date(0).toISOString(),
    } as CropListing;
  });

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUserActiveListings(userId: string): Promise<CropListing[]> {
  const q = query(
    collection(db, "cropListings"),
    where("status", "==", "active"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<CropListing, "id" | "createdAt"> & {
      createdAt?: { toDate?: () => Date };
    };
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date(0).toISOString(),
    } as CropListing;
  });
}
