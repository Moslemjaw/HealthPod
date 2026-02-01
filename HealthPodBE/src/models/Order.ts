export type Order = {
  id: string;
  item: string;
  status: "processing" | "shipped" | "delivered";
  placedOn: string;
};

