export interface KrambambouliCustomer {
  firstName: string;
  lastName: string;
  email: string;
  deliveryOption: string;
  owedAmount: {
    euros: number;
    cents: number;
  };
}

export interface KrambambouliProduct {
  id: number;
  amount: number;
}

export interface KrambambouliCustomerAddress {
  streetName: string;
  houseNumber: number;
  bus?: string;
  post: number;
  city: string;
}
