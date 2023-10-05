
export interface PricesWithPromotion extends Prices, Promotion {}

export interface Prices {
	ItemCode: string
	AllowDiscount: string
	ItemId: string
	ItemName: string
	ItemPrice: string
	ItemStatus: string
	ItemType: string
	ManufactureCountry: string
	ManufacturerItemDescription: string
	ManufacturerName: string
	PriceUpdateDate: string
	QtyInPackage: string
	Quantity: string
	UnitOfMeasure: string
	UnitOfMeasurePrice: string
	UnitQty: string
	bIsWeighted: string
	promotions: Promotion[]
}

export interface Promotion {
	PromotionId?: string
	PromotionDescription?: string
	PromotionEndDate?: string
	PromotionUpdateDate?: string
	PromotionStartDate?: string
	PromotionMinQty?: string 
	PromotionDiscountedPrice?: string 
	PromotionDiscountedPricePerMida?: string 
	PromotionMinNoOfItemOfered?: string 
	PromotionWeightUnit?: string
	PromotionDiscountRate?: string
	PromotionItemCode?: string[]
}
