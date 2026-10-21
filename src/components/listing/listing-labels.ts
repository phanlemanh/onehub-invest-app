/** Nhãn Airbnb → tiếng Việt, dùng chung cho trang listing và thẻ listing. */
const ROOM_TYPE_VI: Record<string, string> = {
  "Entire home/apt": "Nguyên căn",
  "Private room": "Phòng riêng",
  "Hotel room": "Phòng khách sạn",
  "Shared room": "Phòng ở chung",
}

export const roomTypeVi = (roomType: string | null) =>
  roomType ? (ROOM_TYPE_VI[roomType] ?? roomType) : null

export const bedroomsVi = (bedrooms: number | null) =>
  bedrooms === null ? null : bedrooms === 0 ? "Studio" : `${bedrooms} PN`

/** "abnb_12345" → link phòng trên Airbnb; null nếu mã không theo dạng đó. */
export function airbnbUrlOf(id: string) {
  const m = /^abnb_(\d+)$/.exec(id)
  return m ? `https://www.airbnb.com/rooms/${m[1]}` : null
}
